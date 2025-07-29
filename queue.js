require('dotenv').config();
const redisOK = !!process.env.REDIS_URL;
let Queue, queue;

if (redisOK) {
  ({ Queue } = require('bullmq'));
  queue = new Queue('send', { connection: { url: process.env.REDIS_URL } });
} else {
  // naïve in-memory queue (fine for dev)
  const events = [];
  queue = {
    add: (_, data) => events.push(data),
    processLoop: cb => setInterval(async () => {
      if (events.length) await cb({ data: events.shift() });
    }, 1000),
  };
}

module.exports = queue;
