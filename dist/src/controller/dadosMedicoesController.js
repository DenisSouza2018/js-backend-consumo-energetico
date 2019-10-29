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
const sensorController_1 = require("./sensorController");
const notificationController_1 = require("./notificationController");
class DadosMedicoesController {
    cadastrarDadosMedicao(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            const headers = req.headers;
            if (utils_1.Utils.isAuthenticated(headers)) {
                const body = req.body;
                // Log
                console.info(`Recebi um POST em /cadastrarDadosMedicao. Dados ${JSON.stringify(body)}`);
                const macSensor = body.macsensor;
                const corrente = body.corrente;
                const tensao = 127; //TODO: Alterar para tensão no momento do cadastro do sensor
                const potencia = (corrente * tensao) / 1000; //W para KW
                const dataEnvio = body.timestamp;
                response = yield DadosMedicoesController.salvaDadosSensor(corrente, potencia, dataEnvio, macSensor);
                // Preciso fazer tudo assincrono, pois essa parte não pode atrapalhar o sync do sensor...
                DadosMedicoesController.verificaNotificacaoSmartphones(macSensor);
            }
            else {
                response = {
                    id: null,
                    success: false,
                    isAuthenticated: false
                };
            }
            res.send(response);
        });
    }
    listarConsumoSensor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = req.body;
            let dadosMedicoes = yield DadosMedicoesController.listarMedicoes(body.dataMin, body.dataMax, body.macSensor);
            let response = {
                isAuthenticated: true,
                consumoTotal: dadosMedicoes.length,
                dadosMedicoes: {}
            };
            response.dadosMedicoes = DadosMedicoesController.agruparDadosMedicaoDia(dadosMedicoes);
            response.consumoTotal = DadosMedicoesController.somarTodasPotencias(response.dadosMedicoes);
            res.send(response);
        });
    }
    static salvaDadosSensor(corrente, potencia, dataEnvio, macSensor) {
        return __awaiter(this, void 0, void 0, function* () {
            let DadosMedicao = mongoose.model('DadosMedicao', mongoModels.DadosMedicao);
            const dadosMedicao = new DadosMedicao({
                corrente: corrente,
                potencia: potencia,
                dataEnvio: dataEnvio,
                macSensor: macSensor
            });
            const mongoInsertion = yield DadosMedicao.collection.insertOne(dadosMedicao);
            let localISOTime = utils_1.Utils.geraDataNow();
            if (mongoInsertion.insertedId && sensorController_1.SensorController.atualizacaoDataSensor(macSensor, localISOTime))
                return {
                    id: mongoInsertion.insertedId,
                    success: true,
                    isAuthenticated: true
                };
            else
                return {
                    id: null,
                    success: false,
                    isAuthenticated: true
                };
        });
    }
    static listarMedicoes(dataMin, dataMax, macSensor) {
        return __awaiter(this, void 0, void 0, function* () {
            let filter = {};
            if ((utils_1.Utils.isStrValid(dataMin) && utils_1.Utils.isStrValid(dataMax)) || utils_1.Utils.isStrValid(macSensor)) {
                filter['$and'] = [];
            }
            if (utils_1.Utils.isStrValid(dataMin) && utils_1.Utils.isStrValid(dataMax)) {
                filter['$and'].push({ dataEnvio: { $gte: dataMin, $lt: dataMax } });
            }
            if (utils_1.Utils.isStrValid(macSensor)) {
                filter['$and'].push({ macSensor: macSensor });
            }
            console.debug('ListarMedicoes recebeu filtro->', JSON.stringify(filter));
            let DadosMedicao = mongoose.model('DadosMedicao', mongoModels.DadosMedicao);
            const dadosMedicoes = yield DadosMedicao.find(filter).sort({ dataEnvio: 1 });
            return dadosMedicoes;
        });
    }
    static verificaNotificacaoSmartphones(macSensor) {
        // Vou fazer uma busca do consumo do mês
        const dataMin = utils_1.Utils.primeiroDiaMesCorrente() + " 00:00:00";
        const dataMax = utils_1.Utils.ultimoDiaMesCorrente() + " 23:59:59";
        DadosMedicoesController.listarMedicoes(dataMin, dataMax, macSensor).then((res) => {
            const dadosMedicoes = DadosMedicoesController.agruparDadosMedicaoDia(res);
            const consumoTotal = DadosMedicoesController.somarTodasPotencias(dadosMedicoes);
            if (consumoTotal > 0) {
                sensorController_1.SensorController.buscaSensores(undefined, macSensor).then((sensores) => {
                    if (sensores.length > 0) {
                        const sensor = sensores[0];
                        if (utils_1.Utils.isStrValid(sensor.limiteAlerta)) {
                            // if (parseFloat(sensor.limiteAlerta) > consumoTotal) { // TODO: Remover (DEBUG MODE)
                            if (consumoTotal > parseFloat(sensor.limiteAlerta)) {
                                console.debug("Enviando alertas para os smartphones...");
                                notificationController_1.NotificationController.buscaTokens(sensor.idCliente).then((tokens) => {
                                    for (let tokenBusca of tokens) {
                                        const notificationTitle = `ALERTA!`;
                                        const notificationBody = `Atenção, o seu consumo ultrapassou o limite de ${sensor.limiteAlerta}kw/h.\nEsse mês você já consumiu o equivalente à ${consumoTotal.toFixed(2)}kw/h!`;
                                        if (tokenBusca.token != null)
                                            notificationController_1.NotificationController.enviarNotificacao(tokenBusca.token, notificationTitle, notificationBody);
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
        console.log('datas', dataMin, dataMax);
    }
    static verificaConsumoSmartphones(macSensor) {
        return __awaiter(this, void 0, void 0, function* () {
            // Vou fazer uma busca do consumo do mês
            const dataMin = utils_1.Utils.primeiroDiaMesCorrente() + " 00:00:00";
            const dataMax = utils_1.Utils.ultimoDiaMesCorrente() + " 23:59:59";
            let res = yield DadosMedicoesController.listarMedicoes(dataMin, dataMax, macSensor);
            const dadosMedicoes = DadosMedicoesController.agruparDadosMedicaoDia(res);
            return DadosMedicoesController.somarTodasPotencias(dadosMedicoes);
        });
    }
    static somarTodasPotencias(dadosMedicoes) {
        let potenciaTotal = 0;
        const keys = Object.keys(dadosMedicoes);
        for (let key of keys) {
            potenciaTotal += dadosMedicoes[key];
        }
        return potenciaTotal;
    }
    static agruparDadosMedicaoDia(dadosMedicoes) {
        let localDadosMedicao = {};
        for (let dadoMedicao of dadosMedicoes) {
            const keyDay = dadoMedicao.dataEnvio.substring(0, 10);
            if (Object.keys(localDadosMedicao).indexOf(keyDay) == -1)
                localDadosMedicao[keyDay] = 0;
            localDadosMedicao[keyDay] += dadoMedicao.potencia;
        }
        return localDadosMedicao;
    }
}
exports.DadosMedicoesController = DadosMedicoesController;
const dadosMedicoesController = new DadosMedicoesController();
exports.default = dadosMedicoesController;
