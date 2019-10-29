"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controller/userController"));
const sensorController_1 = __importDefault(require("../controller/sensorController"));
const utils_1 = require("./utils");
const dadosMedicoesController_1 = __importDefault(require("../controller/dadosMedicoesController"));
const notificationController_1 = __importDefault(require("../controller/notificationController"));
class ApiRoutes {
    constructor() {
        this.router = express_1.Router();
        this.config();
    }
    config() {
        this.router.get('/', (req, res) => {
            res.send({ "message": "It works!" });
        });
        //Teste de rotas
        this.router.get('/listarSensores', sensorController_1.default.listarSensores);
        this.router.post('/login', userController_1.default.loginUsuario);
        this.router.post('/cadastrarUsuario', userController_1.default.cadastrarUsuario);
        this.router.post('/dados', utils_1.Utils.verifyJWT, sensorController_1.default.listarSensoresCliente);
        this.router.post('/alterarSensorApelido', utils_1.Utils.verifyJWT, sensorController_1.default.alterarSensorApelido);
        this.router.post('/alterarSensorLimite', utils_1.Utils.verifyJWT, sensorController_1.default.alterarSensorLimite);
        // Listar consumo
        this.router.post('/listarConsumoSensor', utils_1.Utils.verifyJWT, dadosMedicoesController_1.default.listarConsumoSensor);
        // Notificacoes
        this.router.post('/storeToken', utils_1.Utils.verifyJWT, notificationController_1.default.storeToken);
        // Salvar sensor para cliente
    }
}
const apiRoutes = new ApiRoutes();
exports.default = apiRoutes.router;
