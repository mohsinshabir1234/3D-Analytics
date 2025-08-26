import {Worker} from 'bullmq';
import IORedis from 'ioredis';
import parseLogFile from '../parser/parser.js';
import WebSocket from 'ws';
import {  putDataInSpatialSupabase,putDataInStatsSupabase } from './supabaseHelpers.js';

// i will change the socket address when ill docker compose
const ws = new WebSocket(`ws://localhost:4000`);
ws.on('open', () => console.log('Worker connected to WebSocket server'));

let position_x
let position_y
let position_z
const connection = new IORedis({maxRetriesPerRequest:null});
let status = "not started";
const logFileWorker = new Worker("logFileForParsing",async job =>{
  status ="processing"
  const parsedData = await parseLogFile(job.data.location)
  status ="complete"
  const userId = parsedData.parsedAll.userid
  const error_count = parsedData.ecount
  const info_count = parsedData.icount
  const warning_count = parsedData.wcount
  const log_level = parsedData.parsedAll.level
  const time_stamp = parsedData.parsedAll.timestamp
  const ip_address = parsedData.parsedAll.ip 
  const message = parsedData.parsedAll.message
  position_x =parsedData.parsedAll.coordinates.x
  position_y = parsedData.parsedAll.coordinates.y 
  position_z = parsedData.parsedAll.coordinates.z
  const {data:statsData,error:statsError}= await putDataInStatsSupabase(userId,error_count,info_count,warning_count,status,job.id)
  
   if (!statsError && statsData.length > 0 && ws.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify({ type: 'log_stats_update', data: statsData[0] })); } catch(e){console.error(e);}
}
    await job.updateProgress(100);
    console.log("Job Done")
    return {completeData:parsedData,logStatus:status}
},{connection,concurrency:4})
logFileWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
logFileWorker.on("failed",(job)=>{
    console.log("Job has failed",job.id);
})
