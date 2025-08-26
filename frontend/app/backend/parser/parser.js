import fs from "fs";
import readline from "readline";
import { coordinates_data } from "./clustering.js";
import clustering from "./clustering.js";
import geo_lookup from "./geoLocation.js";
import { putDataInSpatialSupabase } from "../workers/supabaseHelpers.js";
import WebSocket from 'ws';

export let infoCount = 0;
export let warningCount = 0;
export let errorCount = 0;

const ws = new WebSocket(`ws://localhost:4000`);
ws.on('open', () => console.log('Worker connected to WebSocket server'));

async function parseLogFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let rawData = [];
  let batchLogs = [];
  let parsed;

  for await (const line of rl) {
    try {
      parsed = JSON.parse(line);

      console.log("Time:", parsed.timestamp);
      console.log("Level:", parsed.level);
      console.log("Message:", parsed.message);
      console.log("User ID:", parsed.userid);
      console.log("IP:", parsed.ip);
      console.log("Coordinates:", parsed.coordinates);
      console.log("----");

      rawData.push(parsed.coordinates);

      // Prepare batch log object
      batchLogs.push({
        job_id: "NA", // replace with dynamic ID if needed
        x: parsed.coordinates.x,
        y: parsed.coordinates.y,
        z: parsed.coordinates.z,
        level: parsed.level,
        timestamp: parsed.timestamp,
        ip: parsed.ip,
        message: parsed.message
      });

      // Count log levels
      switch (parsed.level) {
        case "INFO":
          infoCount++;
          break;
        case "ERROR":
          errorCount++;
          break;
        case "WARNING":
          warningCount++;
          break;
        default:
          console.log("Unknown log level detected")
      }

      geo_lookup(parsed.ip);

    } catch (err) {
      console.error("Failed to parse line:", line, err.message);
    }
  }

  console.log("These are level counts", infoCount, errorCount, warningCount);

  // Prepare coordinates data for clustering
  coordinates_data.length = 0;
  for (const p of rawData) {
    coordinates_data.push([p.x, p.y, p.z]);
  }
  console.log("These are coordinates data", coordinates_data);

  // Send all logs at once to Supabase
  try {
    const { data: spatialData, error: spatialError } = await putDataInSpatialSupabase(batchLogs);
    if (!spatialError && spatialData.length > 0 && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ type: 'log_spatial_update', data: spatialData })); }
      catch (e) { console.error(e); }
    }
  } catch (err) {
    console.error("Failed to push batch to Supabase:", err.message);
  }

  const clusteringData = clustering();

  return {
    clustering: clusteringData,
    parsedAll: parsed,
    icount: infoCount,
    wcount: warningCount,
    ecount: errorCount
  };
}

export default parseLogFile;
