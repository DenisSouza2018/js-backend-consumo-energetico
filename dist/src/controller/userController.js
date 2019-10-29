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
const jwt = __importStar(require("jsonwebtoken"));
const SECRET = process.env.SECRET || "sleocgrient";
class UserController {
    loginUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            const body = req.body;
            // Log
            console.info(`Recebi um POST em /loginUsuario. Dados ${JSON.stringify(body)}`);
            const email = body.email;
            let senha = body.senha;
            if (utils_1.Utils.isStrValid(email) && utils_1.Utils.isStrValid(senha)) {
                // Criptografando senha
                senha = utils_1.Utils.encryptPassword(senha);
                // Faço busca no banco
                response = yield UserController.buscaDadosUsuario(email, senha);
                if (response.success)
                    response['token'] = jwt.sign({ "usuario": response.usuario }, SECRET, {
                        expiresIn: 60 * 60 // 1 Hora
                    });
                if (response.usuario)
                    delete response.usuario._id;
            }
            else {
                response = UserController.geraRespostaCompleta(false, 'Preencha todos os campos!');
            }
            res.send(response);
        });
    }
    cadastrarUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            const body = req.body;
            // Log
            console.info(`Recebi um POST em /cadastrarUsuario. Dados ${JSON.stringify(body)}`);
            const nome = body.nome;
            const dataNascimento = body.dataNascimento;
            const email = body.email;
            let senha = body.senha;
            const confirmarSenha = body.confirmarSenha;
            // Verifico se todos os campos foram preenchidos
            if (utils_1.Utils.isStrValid(nome) && utils_1.Utils.isStrValid(dataNascimento) && utils_1.Utils.isStrValid(email)
                && utils_1.Utils.isStrValid(senha) && utils_1.Utils.isStrValid(confirmarSenha)) {
                // Verifico se a senha informada eh igual a inserida na confirmação
                if (senha == confirmarSenha) {
                    senha = utils_1.Utils.encryptPassword(senha);
                    //Tento inserir no banco
                    try {
                        response = yield UserController.salvaDadosUsuario(nome, dataNascimento, email, senha);
                    }
                    catch (e) {
                        response = {
                            success: false,
                            msg: 'Já existe um usuário cadastrado com esse e-mail!'
                        };
                        console.error(e);
                    }
                }
                else {
                    response = UserController.geraRespostaCompleta(false, 'Erro ao cadastrar. As senhas inseridas não conferem!');
                }
            }
            else {
                response = UserController.geraRespostaCompleta(false, 'Erro ao cadastrar. Preencha todos os campos!');
            }
            res.send(response);
        });
    }
    static buscaDadosUsuario(email, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            let Usuarios = mongoose.model('Usuario', mongoModels.Usuarios);
            const usuario = {
                email: email,
                senha: senha
            };
            try {
                const listUsuario = yield Usuarios.find(usuario);
                return this.processarRespostaUsuarios(listUsuario);
            }
            catch (e) {
                console.error(e);
                return UserController.geraRespostaCompleta(false, "Ocorreu um erro interno");
            }
        });
    }
    static processarRespostaUsuarios(users) {
        if (utils_1.Utils.listTest(users[0])) {
            const user = users[0];
            return {
                success: true,
                usuario: {
                    _id: user._id,
                    nome: user.nome,
                    modulos: user.modulos
                }
            };
        }
        else {
            return UserController.geraRespostaCompleta(false, 'Combinação de usuário/senha não conferem');
        }
    }
    static salvaDadosUsuario(nome, dataNascimento, email, senha) {
        return __awaiter(this, void 0, void 0, function* () {
            let Usuarios = mongoose.model('Usuario', mongoModels.Usuarios);
            const usuarios = new Usuarios({
                nome: nome,
                dataNascimento: dataNascimento,
                email: email,
                senha: senha,
                modulos: []
            });
            const mongoInsertion = yield Usuarios.collection.insertOne(usuarios);
            if (mongoInsertion.insertedId)
                return this.geraRespostaCompleta(true, 'Usuario inserido com sucesso!');
            else
                return this.geraRespostaCompleta(false, 'Erro ao cadastrar usuário, tente novamente mais tarde!');
        });
    }
    static geraRespostaCompleta(success, msg) {
        return {
            success: success,
            msg: msg,
            token: ''
        };
    }
}
const userController = new UserController();
exports.default = userController;
