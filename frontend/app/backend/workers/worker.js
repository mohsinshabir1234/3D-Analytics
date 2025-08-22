import {Worker} from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({maxRetriesPerRequest:null});

const logFileWorker = new Worker("logFileForParsing",async job =>{
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