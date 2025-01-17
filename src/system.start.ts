import express, {Application} from 'express';
import morgan from 'morgan';
import cors from 'cors';

import apiRoutes from "./routes/apiRoutes";
import sensorRoutes from './routes/sensorRoutes';
import {Mongoose} from "mongoose";
import config from "../config.json";
import {MongoClient} from "./database.start";

class Server {

    public app: Application;
    public mongoUrl = config.databaseConf.mongo.host;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    config(): void {
        if (process.env.AMBIENTE == "prod") {
            this.app.set('port', process.env.PORT || 80);
            this.mongoUrl = "localhost";
        } else {
            this.app.set('port', process.env.PORT || 3000);
        }

        this.app.set('timeout', (30 * 60000));
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
    }

    routes(): void {
        this.app.use('/appsensor', sensorRoutes);

        this.app.use('/api', apiRoutes);
    }

    start(): void {
        this.app.listen(this.app.get('port'), async () => {
            console.log('Server on port', this.app.get('port'));
            const connection: Mongoose = await MongoClient.mongoConnection;
            console.log(`MongoDB conectado em 'mongodb://${this.mongoUrl}/${config.databaseConf.mongo.database}' com sucesso!`);
        });
    }
}

const server = new Server();
server.start();
