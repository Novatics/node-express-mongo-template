import Accounts from '../models/Accounts';
import Persons from '../models/Persons';

class SessionController {
    async login(req, res) {
        try {
            const { email, password } = req.body;

            const account = await Accounts.findOne({ email });

            // not found
            if (!account) {
                throw new Error('Seu cadastro não foi encontrado.');
            }

            // password
            if (!(await account.compareHash(password))) {
                throw new Error('Usuário ou senha inválida.');
            }

            // status
            if (!account.checkStatus()) {
                throw new Error('Sua conta não foi verificada, visualize seu email.');
            }

            console.log(account);

            return res.status(200).json({
                account,
                token: Accounts.generateToken({ account })
            });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    async loggedUser(req, res) {
        try {
            const account = await Persons.findOne({
                account: req.accountId
            }).populate('account');

            return res.status(200).json(account);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
}

export default new SessionController();
