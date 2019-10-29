"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.Modulos = new Schema({
    mac: String,
    key: String
});
