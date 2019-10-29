"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../routes/utils");
const mongoModels = __importStar(require("../models/mongo/index"));
const mongoose = __importStar(require("mongoose"));
const dadosMedicoesController_1 = require("./dadosMedicoesController");
class SensorController {
    ///----------------------
    listarSensores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                isAuthenticated: true,
                sensores: {}
            };
            if (utils_1.Utils.listTest(req.user.usuario)) {
                const idUsuario = req.user.usuario._id;
                response.sensores = yield (yield SensorController.buscaSensores(idUsuario));
            }
            res.send(response);
        });
    }
    ///-------------------------
    listarSensoresCliente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                isAuthenticated: true,
                sensores: {}
            };
            if (utils_1.Utils.listTest(req.user.usuario)) {
                const idUsuario = req.user.usuario._id;
                response.sensores = yield (yield SensorController.buscaSensores(idUsuario));
            }
            res.send(response);
        });
    }
    alterarSensorApelido(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                isAuthenticated: true,
                success: false
            };
            if (utils_1.Utils.listTest(req.user.usuario)) {
                const sensor = req.body.sensor;
                response.success = yield SensorController.atualizaApelidoSensor(sensor._id, sensor.apelido);
            }
            res.send(response);
        });
    }
    alterarSensorLimite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                isAuthenticated: true,
                success: false
            };
            if (utils_1.Utils.listTest(req.user.usuario)) {
                const sensor = req.body.sensor;
                response.success = yield SensorController.atualizaLimiteSensor(sensor._id, sensor.limiteAlerta);
            }
            res.send(response);
        });
    }
    static buscaSensores(idCliente, macSensor) {
        return __awaiter(this, void 0, void 0, function* () {
            let Sensores = mongoose.model('Sensores', mongoModels.Sensores);
            let sensor = {};
            if (idCliente != null) {
                sensor['idCliente'] = idCliente;
            }
            if (macSensor != null) {
                sensor['macSensor'] = macSensor;
            }
            let idx = 0;
            let sensoresDB = yield Sensores.find(sensor);
            let sensores = [];
            for (let s of sensoresDB) {
                const sensor = {
                    apelido: s.apelido,
                    consumo: yield dadosMedicoesController_1.DadosMedicoesController.verificaConsumoSmartphones(s.macSensor),
                    idCliente: s.idCliente,
                    key: s.key,
                    limiteAlerta: s.limiteAlerta,
                    macSensor: s.macSensor,
                    ultimaComunicacao: s.ultimaComunicacao,
                    _id: s._id
                };
                sensores.push(sensor);
            }
            return sensores;
        });
    }
    static atualizaApelidoSensor(idSensor, apelido) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = false;
            let Sensores = mongoose.model('Sensores', mongoModels.Sensores);
            const sensor = yield Sensores.findOne({ _id: idSensor });
            if (sensor != null) {
                sensor.apelido = apelido;
                yield sensor.save();
                success = true;
            }
            return success;
        });
    }
    static atualizaLimiteSensor(idSensor, limite) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = false;
            let Sensores = mongoose.model('Sensores', mongoModels.Sensores);
            const sensor = yield Sensores.findOne({ _id: idSensor });
            if (sensor != null) {
                sensor.limiteAlerta = limite;
                yield sensor.save();
                success = true;
            }
            return success;
        });
    }
    static atualizacaoDataSensor(macSensor, ultimaComunicacao) {
        return __awaiter(this, void 0, void 0, function* () {
            let success = false;
            let Sensores = mongoose.model('Sensores', mongoModels.Sensores);
            const sensor = yield Sensores.findOne({ macSensor: macSensor });
            if (sensor != null) {
                sensor.ultimaComunicacao = ultimaComunicacao;
                yield sensor.save();
                success = true;
            }
            return success;
        });
    }
}
exports.SensorController = SensorController;
const sensorController = new SensorController();
exports.default = sensorController;
