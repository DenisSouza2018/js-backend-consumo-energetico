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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const sensorRoutes_1 = __importDefault(require("./routes/sensorRoutes"));
const config_json_1 = __importDefault(require("../config.json"));
const database_start_1 = require("./database.start");
class Server {
    constructor() {
        this.mongoUrl = config_json_1.default.databaseConf.mongo.host;
        this.app = express_1.default();
        this.config();
        this.routes();
    }
    config() {
        if (process.env.AMBIENTE == "prod") {
            this.app.set('port', process.env.PORT || 80);
            this.mongoUrl = "localhost";
        }
        else {
            this.app.set('port', process.env.PORT || 3000);
        }
        this.app.set('timeout', (30 * 60000));
        this.app.use(morgan_1.default('dev'));
        this.app.use(cors_1.default());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
    }
    routes() {
        this.app.use('/appsensor', sensorRoutes_1.default);
        this.app.use('/api', apiRoutes_1.default);
    }
    start() {
        this.app.listen(this.app.get('port'), () => __awaiter(this, void 0, void 0, function* () {
            console.log('Server on port', this.app.get('port'));
            const connection = yield database_start_1.MongoClient.mongoConnection;
            console.log(`MongoDB conectado em 'mongodb://${this.mongoUrl}/${config_json_1.default.databaseConf.mongo.database}' com sucesso!`);
        }));
    }
}
const server = new Server();
server.start();
