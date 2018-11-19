"use strict";
/**
 * Entrypoint for sount backend.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var db_1 = require("./db");
var express_fileupload_1 = __importDefault(require("express-fileupload"));
var oauth_1 = require("./auth/oauth");
var config = {
    port: 8004
};
var app;
db_1.setupDb().then(function () {
    app = express_1.default();
    app.use(function (req, res, next) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        next();
    });
    app.use(express_1.default.json());
    app.use(oauth_1.authorize);
    app.use(function (req, res, next) {
        try {
            next();
        }
        catch (e) {
            next(e);
        }
    });
    var maxFileSize = 50 * 1024 * 1024;
    app.use(express_fileupload_1.default({
        limits: {
            fileSize: maxFileSize
        }
    }));
    app.listen(config.port, function () {
        console.log("App listening on port :" + config.port);
    });
    var basePath = '/api';
    app.get(basePath + "/enterprises", require('./get/enterprises').default);
    app.get(basePath + "/enterprise/:enterpriseId/bmc/", require('./get/bmc').default);
    app.post(basePath + "/enterprises", require('./post/enterprises').default);
    app.post(basePath + "/enterprise/:enterpriseId/member", require('./post/member').default);
    app.delete(basePath + "/enterprise/:enterpriseId/member/:targetEmail", require('./delete/member').default);
    app.put(basePath + "/enterprises/:enterpriseId/bmc/:cardId", require('./put/bmc_card').default);
    app.delete(basePath + "/enterprises/:enterpriseId/bmc/:cardId", require('./put/bmc_card').default);
});
