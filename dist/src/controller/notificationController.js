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
const mongoModels = __importStar(require("../models/mongo/index"));
const mongoose = __importStar(require("mongoose"));
const FCM = require("fcm-node");
const utils_1 = require("../routes/utils");
const serverKey = __importStar(require("../../consumo-energ-169a4-firebase-adminsdk-95yad-37480a86a6.json"));
const fcm = new FCM(serverKey);
class NotificationController {
    static enviarNotificacao(token, title, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const token_array = yield NotificationController.buscaTodosTokens();
            for (let i = 0; i < token_array.length; i++) {
                const message = {
                    to: token,
                    notification: {
                        title: title,
                        body: body
                    }
                };
                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Erro ao enviar notificação!", err, response);
                    }
                    else {
                        console.log("Notificação enviada! Token: " + token);
                    }
                });
            }
        });
    }
    storeToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const idCliente = req.user.usuario._id;
            const token = req.body.token;
            let resposta;
            resposta = {
                success: yield NotificationController.salvaDadosToken(token, idCliente)
            };
            res.send(resposta);
        });
    }
    static salvaDadosToken(token, idCliente) {
        return __awaiter(this, void 0, void 0, function* () {
            let Tokens = mongoose.model('Tokens', mongoModels.Tokens);
            const tokens = new Tokens({
                token: token,
                idCliente: idCliente
            });
            try {
                const mongoInsertion = yield Tokens.collection.insertOne(tokens);
                return (utils_1.Utils.isStrValid(mongoInsertion.insertedId.toString()));
            }
            catch (e) {
                let tokenRes = yield Tokens.findOne({ "token": token });
                tokenRes.idCliente = idCliente;
                yield tokenRes.save();
                tokenRes = yield Tokens.findOne({ "idCliente": idCliente });
                tokenRes.token = token;
                yield tokenRes.save();
                return true;
            }
        });
    }
    static buscaTodosTokens() {
        return __awaiter(this, void 0, void 0, function* () {
            let Tokens = mongoose.model('Tokens', mongoModels.Tokens);
            return yield Tokens.find({});
        });
    }
    static buscaTokens(idCliente) {
        return __awaiter(this, void 0, void 0, function* () {
            let Tokens = mongoose.model('Tokens', mongoModels.Tokens);
            return yield Tokens.find({ idCliente: idCliente });
        });
    }
}
exports.NotificationController = NotificationController;
const notificationController = new NotificationController();
exports.default = notificationController;
