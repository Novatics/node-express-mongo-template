import express from 'express';
import { Accounts as AccountsValidator } from '../app/validators';
import { AccountsController } from '../app/controllers';
import authMiddleware from '../middlewares/auth';
import validate from 'express-validation';
import handle from 'express-async-handler';

const routes = express.Router();

/**
 * Accounts
 */

routes.post('/', validate(AccountsValidator.Account), handle(AccountsController.create));

routes.post(
    '/recovery/password',
    validate(AccountsValidator.Password),
    handle(AccountsController.changePassword)
);

routes.get(
    '/active/code/:code',
    validate(AccountsValidator.Active),
    handle(AccountsController.active)
);

routes.get(
    '/resend/email/:email',
    validate(AccountsValidator.Resend),
    handle(AccountsController.resend)
);

routes.get(
    '/recovery/email/:email',
    validate(AccountsValidator.Recovery),
    handle(AccountsController.recovery)
);

module.exports = routes;
