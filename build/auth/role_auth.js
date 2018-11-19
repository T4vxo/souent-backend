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
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../db");
/**
 * Checks user role before handling a request. Ends the request with 403 FORBIDDEN if the required
 * role does not match that of the user's.
 * @param role Required role. "admin" for site administrators, "member" for any member of a social enterprise (where the public ID must be part of the path parameters as :enterpriseId), "contributor" for any signed-in user.
 * @returns Whether the validation succeeded.
 */
function requireRoleWithResponse(role, req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, oauthToken, matchedUser, publicEnterpriseId, enterpriseId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    auth = (req.header("Authorization") || "").trim();
                    if (auth.toLowerCase().indexOf("bearer ") != 0) {
                        res.status(403).end(JSON.stringify({
                            result: 'error',
                            error: 'forbidden',
                            message: 'Missing Bearer header.'
                        }));
                        return [2 /*return*/, false];
                    }
                    oauthToken = auth.substr("bearer ".length);
                    return [4 /*yield*/, getMemberWithToken(oauthToken, ['role', 'enterprise_id'])];
                case 1:
                    matchedUser = _a.sent();
                    if (!matchedUser || !("role" in matchedUser)) {
                        res.status(403).end(JSON.stringify({
                            result: 'error',
                            error: 'forbidden',
                            message: 'Invalid token or without role.'
                        }));
                        return [2 /*return*/, false];
                    }
                    if (role == "admin") {
                        if (matchedUser.role != "admin") {
                            res.status(403).end(JSON.stringify({
                                result: 'error',
                                error: 'forbidden',
                                message: 'Admin permission required.'
                            }));
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    }
                    if (!(role == "member")) return [3 /*break*/, 3];
                    publicEnterpriseId = req.param("enterpriseId", "");
                    return [4 /*yield*/, db_1.query("SELECT id FROM enterprise WHERE public_id = ? LIMIT 1", [publicEnterpriseId], {
                            forceArray: false,
                            skipObjectIfSingleResult: true
                        })];
                case 2:
                    enterpriseId = _a.sent();
                    console.log("enterprise id: ", enterpriseId, typeof enterpriseId, "matched user enterprise id: ", matchedUser.enterprise_id, typeof matchedUser.enterprise_id);
                    if (matchedUser.enterprise_id != enterpriseId) {
                        res.status(403).end(JSON.stringify({
                            result: 'error',
                            error: 'forbidden',
                            message: 'Denied from the enterprise with ID: ' + publicEnterpriseId + '.'
                        }));
                        return [2 /*return*/, false];
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, true];
            }
        });
    });
}
exports.requireRoleWithResponse = requireRoleWithResponse;
function getMemberWithToken(token, columns) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.query("SELECT " + columns.join(",") + " FROM user WHERE secret = ?", [token])];
        });
    });
}
