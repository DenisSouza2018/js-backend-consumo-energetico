"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dadosMedicoesController_1 = __importDefault(require("../controller/dadosMedicoesController"));
const utils_1 = require("./utils");
class SensorRoutes {
    constructor() {
        this.router = express_1.Router();
        this.config();
    }
    config() {
        this.router.get('/', (req, res) => {
            res.send({ "message": "It works!" });
        });
        this.router.post('/auth', (req, res) => {
            const body = req.body;
            const macAddress = body.macAddress;
            const key = utils_1.Utils.gerarChave(macAddress);
            // Log
            console.info(`Recebi um POST em /auth. Dados ${JSON.stringify(body)}`);
            // TODO: Fazer validação do MAC no banco de dados
            const returnObj = {
                success: true,
                macAddress: macAddress,
                key: key
            };
            res.json(returnObj);
        });
        this.router.post('/cadastrarDadosMedicao', dadosMedicoesController_1.default.cadastrarDadosMedicao);
    }
}
const sensorRoutes = new SensorRoutes();
exports.default = sensorRoutes.router;
