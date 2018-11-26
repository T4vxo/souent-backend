/**
 * Entrypoint for sount backend.
 */

import express, { Request, Response } from 'express';
import { setupDb } from './db';
import fileUpload from 'express-fileupload';
import { authorize } from './auth/oauth';
import cors from 'cors';

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
  app.use(cors({
    origin: 'http://localhost:8080'
  }));
  app.use(express.json());
  app.use(authorize);
  app.use((req, res, next) => {
    try {
      next();
    } catch (e) {
      next(e);
    }
  });
  
  const maxFileSize = 50 * 1024 * 1024;
  app.use(fileUpload({
    limits: {
      fileSize: maxFileSize
    }
  }))

  app.listen(config.port, () => {
    console.log("App listening on port :" + config.port);
  });

  const basePath = '/api';
  app.get(`${basePath}/enterprises`, require('./get/enterprises').default);
  app.get(`${basePath}/enterprise/:enterpriseId/bmc/`, require('./get/bmc').default);
  app.post(`${basePath}/enterprises`, require('./post/enterprises').default);
  app.post(`${basePath}/enterprise/:enterpriseId/member`, require('./post/member').default);
  app.delete(`${basePath}/enterprise/:enterpriseId/member/:targetEmail`, require('./delete/member').default);
  app.put(`${basePath}/enterprises/:enterpriseId/bmc/:cardId`, require('./put/bmc_card').default);
  app.delete(`${basePath}/enterprises/:enterpriseId/bmc/:cardId`, require('./put/bmc_card').default);
  app.post(`${basePath}/user/sign_up`, require('./post/sign_up').default)
})