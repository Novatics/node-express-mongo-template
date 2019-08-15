import express from 'express';
import authMiddleware from '../middlewares/auth';
import { Persons as PersonsValidator } from '../app/validators';
import { PersonsController } from '../app/controllers';
import validate from 'express-validation';
import handle from 'express-async-handler';

const routes = express.Router();

/**
 * Protect Routers
 */
routes.use(authMiddleware);

/**
 * Sessiosn
 */
routes.get('/', handle(PersonsController.index));
routes.get('/:id', handle(PersonsController.show));
routes.post('/', validate(PersonsValidator), handle(PersonsController.store));
routes.put('/:id', validate(PersonsValidator), handle(PersonsController.update));
routes.delete('/:id', handle(PersonsController.destroy));

module.exports = routes;
