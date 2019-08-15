import 'dotenv/config';
import path from 'path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import Youch from 'youch';
import forTerminal from 'youch-terminal';
import validate from 'express-validation';
import dbConfig from './config/database';
import rateLimit from 'express-rate-limit';
import * as routes from './routes/index';

class App {
    constructor() {
        this.express = express();
        this.middlewares();
        this.database();
        this.routes();
        this.exception();
    }

    middlewares() {
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(express.json());
    }

    database() {
        mongoose.connect(dbConfig.uri, {
            useCreateIndex: true,
            useNewUrlParser: true
        });
        mongoose.set('count', false);
    }

    rateLimiter() {
        return rateLimit({
            windowMs: 5 * 60 * 1000, // 1 hour window
            max: 10, // start blocking after 5 requests
            message: {
                error: 'Limite de tentativas excedido, tente novamente em alguns minutos.'
            }
        });
    }

    routes() {
        this.express.use('/accounts', routes.accounts);
        this.express.use('/sessions', routes.sessions);

        // required jwt
        this.express.use('/persons', routes.persons);
    }

    exception() {
        this.express.use(async (err, req, res, next) => {
            console.log(err);

            if (err instanceof validate.ValidationError) {
                return res.status(err.status).json(err);
            }

            if (process.env.NODE_ENV !== 'production') {
                const youch = await new Youch(err, req).toJSON(); // Não precisa do req se for JSON, só HTML
                console.log(forTerminal(youch));
                return res.json(youch);
            }

            return res.status(err.status || 500).json({ error: 'Internal server error' });
        });
    }
}

module.exports = new App().express;
