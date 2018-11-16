/**
 * Entrypoint for sount backend.
 */

import express from 'express';
import mysql from 'mysql';
import { setupDb } from './db';

const config = {
  port: 8004
};

let app: express.Application;

setupDb().then(() => {
  app = express();
  app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
  });

  app.listen(config.port, () => {
    console.log("App listening on port :" + config.port);
  });

  const basePath = '/api';
  app.get(`${basePath}/enterprises`, require('./get/enterprises').default);
  app.get(`${basePath}/enterprise/:enterpriseId/bmc/`, require('./get/bmc').default);
  app.post(`${basePath}/enterprise/:enterpriseId/bmc/`, require('./get/bmc').default);
})