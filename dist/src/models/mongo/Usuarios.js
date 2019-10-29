"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
exports.Usuarios = new Schema({
    nome: String,
    dataNascimento: String,
    email: { type: String, unique: true },
    senha: String,
    modulos: Array
});
