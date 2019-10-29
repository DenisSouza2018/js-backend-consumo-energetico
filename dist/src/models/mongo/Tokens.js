"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.Tokens = new Schema({
    token: String,
    idCliente: String
});
