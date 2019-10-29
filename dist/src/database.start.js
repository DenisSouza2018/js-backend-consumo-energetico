"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("../config.json"));
const mongoose = require('mongoose');
class MongoClient {
}
exports.MongoClient = MongoClient;
MongoClient.mongoConnection = mongoose.connect(`mongodb://${config_json_1.default.databaseConf.mongo.host}/${config_json_1.default.databaseConf.mongo.database}`, { useNewUrlParser: true });
