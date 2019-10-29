import * as mongoModels from '../models/mongo/index'
import * as mongoose from "mongoose";

const FCM = require("fcm-node");

import {SensorController} from "./sensorController";
import {Utils} from "../routes/utils";

import * as serverKey from '../../consumo-energ-169a4-firebase-adminsdk-95yad-37480a86a6.json'

const fcm = new FCM(serverKey);

export class NotificationController {
    public static async enviarNotificacao(token: string, title: string, body: string) {
        const token_array: any = await NotificationController.buscaTodosTokens();

        for (let i = 0; i < token_array.length; i++) {
            const message = {
                to: token,
                notification: {
                    title: title,
                    body: body
                }
            };

            fcm.send(message, function (err: any, response: any) {
                if (err) {
                    console.log("Erro ao enviar notificação!", err, response);
                } else {
                    console.log("Notificação enviada! Token: " + token);
                }
            });
        }
    }

    public async storeToken(req: any, res: any) {
        const idCliente = req.user.usuario._id;
        const token = req.body.token;

        let resposta;
        resposta = {
            success: await NotificationController.salvaDadosToken(token, idCliente)
        };
        res.send(resposta);
    }

    static async salvaDadosToken(token: string, idCliente: string) {
        let Tokens = mongoose.model('Tokens', mongoModels.Tokens);
        const tokens = new Tokens({
            token: token,
            idCliente: idCliente
        });

        try {
            const mongoInsertion: any = await Tokens.collection.insertOne(tokens);
            return (Utils.isStrValid(mongoInsertion.insertedId.toString()));
        } catch (e) {
            let tokenRes: any = await Tokens.findOne({"token": token});
            tokenRes.idCliente = idCliente;
            await tokenRes.save();

            tokenRes = await Tokens.findOne({"idCliente": idCliente});
            tokenRes.token = token;
            await tokenRes.save();

            return true;
        }
    }

    static async buscaTodosTokens() {
        let Tokens = mongoose.model('Tokens', mongoModels.Tokens);
        return await Tokens.find({});
    }

    static async buscaTokens(idCliente: string) {
        let Tokens = mongoose.model('Tokens', mongoModels.Tokens);
        return await Tokens.find({idCliente: idCliente});
    }
}

const notificationController = new NotificationController();
export default notificationController;
