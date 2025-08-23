import fs from "fs";
import readline from "readline";
import { coordinates_data } from "./clustering.js";
import clustering from "./clustering.js";
async function parseLogFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  let rawData =[]

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);

      // Use actual keys from your log JSON
      console.log("Time:", parsed.timestamp);
      console.log("Level:", parsed.level);
      console.log("Message:", parsed.message);
      console.log("User ID:", parsed.userid);
      console.log("IP:", parsed.ip);
      console.log("Coordinates:", parsed.coordinates);
      console.log("----");
      rawData.push(parsed.coordinates);

    } catch (err) {
      console.error("Failed to parse line:", line, err.message);
    }
  }
      coordinates_data.push(...rawData.map(p => [p.x, p.y, p.z]));

      console.log(rawData)
      console.log("This is coordinates data ",coordinates_data)
    clustering()

}

export default parseLogFile;
