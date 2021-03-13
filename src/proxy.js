// TODO útfæra proxy virkni
import fetch from 'node-fetch'
import express from 'express';
import redis from 'redis';
import util from 'util';

export const router = express.Router();

const redisOptions = {
  url: 'redis://127.0.0.1:6379/0',
};

const client = redis.createClient(redisOptions);

const asyncGet = util.promisify(client.get).bind(client);
const asyncSet = util.promisify(client.set).bind(client);

const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';

var startTime, endTime;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  return timeDiff;
}

async function get(cacheKey) {
  // Slökkt á cache
  if (!client || !asyncGet) {
    return null;
  }

  let cached;

  try {
    cached = await asyncGet(cacheKey);
  } catch (e) {
    console.warn(`unable to get from cache, ${cacheKey}, ${e.message}`);
    return null;
  }

  if (!cached) {
    return null;
  }

  let result;

  try {
    result = JSON.parse(cached);
  } catch (e) {
    console.warn(`unable to parse cached data, ${cacheKey}, ${e.message}`);
    return null;
  }

  return result;
}

async function set(cacheKey, data, ttl) {
  if (!client || !asyncSet) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    await asyncSet(cacheKey, serialized, 'EX', ttl);
  } catch (e) {
    console.warn('unable to set cache for ', cacheKey);
    return false;
  }

  return true;
}

router.get('/proxy', async(req, res) => {
  let time = req.query.period;
  let sig = req.query.type;
  var newUrl = url;
  let key = time.concat(sig);
  start()
  const cachedData = await get(key);
  if(cachedData == null){
    newUrl = url.concat(sig.concat('_').concat(time).concat('.geojson'));
    const response = await fetch(newUrl);
    let text = await response.json();
    await set(key, text, 100);
    const elapsedTime = end()
    res.send({
        text,
        info: {
            cached: false,
            elapsed: elapsedTime,
          },
    });
  }
  else{
    const text = cachedData;
    const elapsedTime = end();
    res.send({
     text,
     info: {
            cached: true,
            elapsed: elapsedTime,
     },
    });
  }
});
