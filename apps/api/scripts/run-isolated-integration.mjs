import { MongoMemoryServer } from 'mongodb-memory-server';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let database;
let child;
try {
  database = await MongoMemoryServer.create({instance:{ip:'127.0.0.1',dbName:`yashmeen-test-${randomBytes(6).toString('hex')}`}});
  const uri = database.getUri();
  const env = {...process.env, NODE_ENV:'test', TEST_API_URL:'', TEST_MONGO_URI:uri, MONGO_URI:uri,
    JWT_SECRET:randomBytes(32).toString('hex'), RATE_LIMIT_BYPASS:'true', VERCEL:'',
    SMTP_HOST:'',SMTP_USER:'',SMTP_PASS:'',SMTP_PORT:'',EMAIL_FROM:'',
    CLOUDINARY_NAME:'',CLOUDINARY_API_KEY:'',CLOUDINARY_SECRET_KEY:'',
    UPSTASH_REDIS_REST_URL:'',UPSTASH_REDIS_REST_TOKEN:'',CLIENT_URL:'http://127.0.0.1:3000',FRONTEND_URL:'http://127.0.0.1:3000'};
  console.log('Running integration tests with a disposable loopback MongoDB. Business credentials are excluded.');
  child = spawn(process.execPath,['--test','--test-timeout=120000','tests/api-and-security.test.js'],{cwd:root,env,stdio:'inherit'});
  process.once('SIGINT',()=>child?.kill());
  process.once('SIGTERM',()=>child?.kill());
  const code = await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  process.exitCode = code ?? 1;
} finally {
  child?.kill();
  if(database)await database.stop();
}
