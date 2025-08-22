import {Queue} from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis();

export const logFileQueue = new Queue('logFileForParsing',{connection})