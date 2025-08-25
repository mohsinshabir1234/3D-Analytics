import {Worker} from 'bullmq';
import IORedis from 'ioredis';
import parseLogFile from '../parser/parser.js';
import { createClient as createRedisClient } from 'redis';
import {  putDataInSpatialSupabase,putDataInStatsSupabase } from './supabaseHelpers.js';


const redis = createRedisClient({ url: process.env.REDIS_URL });
await redis.connect();

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
  const coordinates_data = parsedData.parsedAll.coordinates
  const log_level = parsedData.parsedAll.level
  const time_stamp = parsedData.parsedAll.timestamp
  const ip_address = parsedData.parsedAll.ip 
  const message = parsedData.parsedAll.message
  position_x =parsedData.parsedAll.coordinates.x
  position_y = parsedData.parsedAll.coordinates.y 
  position_z = parsedData.parsedAll.coordinates.z
  console.log("'this is corrdinates data",parsedData.parsedAll.coordinates.x)
  // console.log("Giving out parsed data ",parsedData.parsedAll," ecount",parsedData.ecount,parsedData.icount,parsedData.wcount)
  putDataInStatsSupabase(userId,error_count,info_count,warning_count,status,job.id)
  putDataInSpatialSupabase(job.id,position_x,position_y,position_z,log_level,time_stamp,ip_address,message)
    await redis.publish('job_updates', JSON.stringify({
    jobId: job.data.jobId,
    event: 'job_complete'
  }));

    await job.updateProgress(100);
    console.log("Job Done")
    return {completeData:parsedData,logStatus:status}
},{connection})
logFileWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
logFileWorker.on("failed",(job)=>{
    console.log("Job has failed",job.id);
})
