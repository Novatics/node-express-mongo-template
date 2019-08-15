import express from 'express';
import { Session as SessionValidator } from '../app/validators';
import { SessionController } from '../app/controllers';
import authMiddleware from '../middlewares/auth';
import validate from 'express-validation';
import handle from 'express-async-handler';

const routes = express.Router();

/**
 * Sessiosn
 */
routes.post('/', validate(SessionValidator), handle(SessionController.login));

/**
 * Protect Routers
 */
routes.use(authMiddleware);

routes.get('/', handle(SessionController.loggedUser));

export default routes;
