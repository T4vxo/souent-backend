"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __importDefault(require("../utils"));
var db_1 = require("../db");
var uuid_1 = __importDefault(require("uuid"));
/**
 * Creates a new enterprise.
 * @author Johan Svensson
 */
exports.default = (function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var body, name, about, logoUri, validationError, publicId, insert;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!utils_1.default.assertParamsWithResponse([
                    'name',
                ], req.body, res)) {
                    return [2 /*return*/];
                }
                body = req.body;
                name = body.name;
                about = body.about;
                logoUri = 'i am logo boi';
                validationError = validate(name, about);
                if (validationError !== true) {
                    return [2 /*return*/, res.status(401).end(JSON.stringify({
                            result: 'error',
                            error: 'validation',
                            message: validationError
                        }))];
                }
                _a.label = 1;
            case 1:
                publicId = uuid_1.default().substr(0, 36);
                _a.label = 2;
            case 2: return [4 /*yield*/, db_1.query("SELECT '1' FROM enterprise WHERE public_id=?", [publicId], { forceArray: true })];
            case 3:
                if ((_a.sent()).length > 0) return [3 /*break*/, 1];
                _a.label = 4;
            case 4: return [4 /*yield*/, db_1.query("INSERT INTO enterprise (name, description, logo, public_id) VALUES (?, ?, ?, ?)", [name, about, logoUri, publicId])];
            case 5:
                insert = _a.sent();
                //  OK
                res.end(JSON.stringify({
                    result: 'ok',
                    enterprise: {
                        id: insert.insertId
                    }
                }));
                return [2 /*return*/];
        }
    });
}); });
/**
 * Validates an enterprise name.
 * @returns Validation error or true if passed.
 */
function validate(name, description) {
    if (!/(\w+){3,}/.test(name)) {
        return "invalidName";
    }
    return true;
}
