"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const forge = require('node-forge');
const jwt = __importStar(require("jsonwebtoken"));
class Utils {
    static isAuthenticated(headers) {
        return (headers.login != null && headers.login != "" && headers.password != null && headers.password != "");
    }
    static gerarChave(key) {
        const passo = 'consumo-energetico';
        const md = forge.md.sha256.create();
        md.update(passo + key);
        const chave = md.digest().toHex();
        const md1 = forge.md.sha1.create();
        md1.update(chave);
        return md1.digest().toHex();
    }
    static encryptPassword(key) {
        const passo = 'p1a2s3s4w5o6r7d8-c@o!n$s%u&m*o(-)e+n=e´r`g~e^t;i.c.o';
        const md = forge.md.sha256.create();
        md.update(passo + key);
        const chave = md.digest().toHex();
        const md1 = forge.md.sha1.create();
        md1.update(chave);
        return md1.digest().toHex();
    }
    static isStrValid(str) {
        return (str != null && str != undefined && str != "");
    }
    static listTest(list) {
        return (list != null && list != undefined);
    }
    static verifyJWT(req, res, next) {
        const token = req.headers['x-access-token'];
        if (!token)
            return res.status(200).send({ isAuthenticated: false, authenticationMessage: 'Token expirado, faça o login novamente!' });
        const secret = process.env.SECRET || "";
        jwt.verify(token, secret, function (err, decoded) {
            if (err)
                return res.status(200).send({ isAuthenticated: false, authenticationMessage: 'Token expirado, faça o login novamente!' });
            // se tudo estiver ok, salva no request para uso posterior
            req.user = decoded;
            next();
        });
    }
    static geraDataNow() {
        const tzoffset = 18000000; // UTC -3
        let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
        return localISOTime.substr(0, localISOTime.length - 4);
    }
    static primeiroDiaMesCorrente() {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().substr(0, 10);
    }
    static ultimoDiaMesCorrente() {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().substr(0, 10);
    }
}
exports.Utils = Utils;
