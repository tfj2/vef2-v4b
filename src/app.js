import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

import { router as proxyRouter } from './proxy.js';

dotenv.config();
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';

const {
  PORT: port = 3001, // Mun verða proxyað af browser-sync í development
} = process.env;

const app = express();

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

// TODO setja upp proxy þjónustu
app.use(proxyRouter);

// TODO birta index.html skjal

app.get('/', (req, res) => {
  res.sendFile(join(path, '../index.html'));
});
/**
 * Middleware sem sér um 404 villur.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function notFoundHandler(req, res, next) {
  const title = 'Síða fannst ekki';
}

/**
 * Middleware sem sér um villumeðhöndlun.
 *
 * @param {object} err Villa sem kom upp
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const title = 'Villa kom upp';
}

app.use(notFoundHandler);
app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
