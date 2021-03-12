// TODO útfæra proxy virkni
import fetch from 'node-fetch'
import express from 'express';

export const router = express.Router();

const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';

router.get('/proxy', async(req, res) => {
  let time = req.query.period;
  let sig = req.query.type;
  var newUrl = url;
  newUrl = url.concat(sig.concat('_').concat(time).concat('.geojson'));
  const response = await fetch(newUrl);
  const text = await response.json();
  res.send(
    text
  )
});