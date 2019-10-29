"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.DadosMedicao = new Schema({
    corrente: Number,
    potencia: Number,
    dataEnvio: String,
    macSensor: String
});
