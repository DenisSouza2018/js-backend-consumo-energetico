"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.Sensores = new Schema({
    idCliente: String,
    apelido: String,
    macSensor: String,
    key: String,
    ultimaComunicacao: String,
    limiteAlerta: String
});
