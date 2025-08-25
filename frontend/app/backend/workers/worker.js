import {Worker} from 'bullmq';
import IORedis from 'ioredis';
import logFileWithPino from '../parser/parser.js';
import wss from ''
import { createClient } from '@supabase/supabase-js';
import { createClient as createRedisClient } from 'redis';

const supabase = createClient(process.env.NEXT_SUPABASE_URL, process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY);
const redis = createRedisClient({ url: process.env.REDIS_URL });

const connection = new IORedis({maxRetriesPerRequest:null});

const logFileWorker = new Worker("logFileForParsing",async job =>{
  logFileWithPino(job.data.location)
    await job.updateProgress(100);
    console.log("Job Done")
    return "Job done"
},{connection})
logFileWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed with result:`, job.returnvalue);
});
logFileWorker.on("failed",(job)=>{
    console.log("Job has failed",job.id);
})