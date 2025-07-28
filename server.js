require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const axios = require('axios');
const validator = require('validator');
const pool = require('./db');
const queue = require('./queue');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 60_000, max: 30 }));

const required = f => (typeof f === 'string' && f.trim().length);

app.get('/health', (_, res) => res.send('OK'));

app.post('/submit-lead', async (req, res) => {
  try {
    const {
      first_name, last_name, email, phonecc, phone, country, referer,
      aff_sub, aff_sub2, aff_sub4, aff_sub5, orig_offer
    } = req.body;

    // Basic validation
    if (
      ![first_name, last_name, phonecc, phone, country].every(required) ||
      !validator.isEmail(email) ||
      !validator.isISO31661Alpha2(country) ||
      !validator.matches(phonecc, /^\+\d{1,4}$/) ||
      !validator.matches(phone, /^\d{4,14}$/)
    ) return res.status(400).json({ error: 'invalid fields' });

    const user_ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    const { rows } = await pool.query(
      `INSERT INTO leads
       (first_name,last_name,email,phonecc,phone,country,referer,
        user_ip,aff_id,offer_id,aff_sub,aff_sub2,aff_sub3,aff_sub4,aff_sub5,orig_offer)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [ first_name, last_name, email, phonecc, phone, country, referer || null,
        user_ip, process.env.AFF_ID, process.env.OFFER_ID,
        aff_sub, aff_sub2, process.env.LANDING_DOMAIN, aff_sub4, aff_sub5, orig_offer ]
    );

    const lead = rows[0];
    await queue.add('send', lead);

    res.status(202).json({ id: lead.id, status: 'queued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// Simple monitor
app.get('/leads', async (_, res) => {
  const { rows } = await pool.query('SELECT id,email,status,attempts,created_at FROM leads ORDER BY id DESC LIMIT 100');
  res.json(rows);
});

// Queue processor (works for both BullMQ & in-memory)
(async () => {
  const processFunc = async job => {
    const lead = job.data;
    const qs = new URLSearchParams({
      first_name: lead.first_name,
      last_name : lead.last_name,
      email     : lead.email,
      phonecc   : lead.phonecc,
      phone     : lead.phone,
      country   : lead.country,
      user_ip   : lead.user_ip,
      aff_sub3  : process.env.LANDING_DOMAIN,
      aff_id    : process.env.AFF_ID,
      offer_id  : process.env.OFFER_ID
    });

    try {
      await axios.get(`${process.env.TRACKER_URL}/tracker?${qs.toString()}`, { timeout: 5000 });
      await pool.query('UPDATE leads SET status=$1 WHERE id=$2', ['sent', lead.id]);
    } catch (err) {
      const attempts = lead.attempts + 1;
      await pool.query(
        'UPDATE leads SET status=$1, attempts=$2, last_error=$3 WHERE id=$4',
        [ attempts >= 3 ? 'error' : 'queued', attempts, err.message, lead.id ]
      );
      if (attempts < 3) queue.add('send', { ...lead, attempts }, { delay: 1000 * 2 ** attempts });
    }
  };

  if (queue.processLoop) {
    // in-memory
    queue.processLoop(processFunc);
  } else {
    // BullMQ
    const { Worker } = require('bullmq');
    new Worker('send', processFunc, { connection: { url: process.env.REDIS_URL } });
  }
})();

app.listen(process.env.PORT, () =>
  console.log(`Lead-CRM listening on http://localhost:${process.env.PORT}`)
);
