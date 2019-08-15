import Accounts from '../models/Accounts';
import Persons from '../models/Persons';
import bcrypt from 'bcryptjs';
import uuidv4 from 'uuid/v4';
import Mail from '../services/Mail';

const AccountController = {
    create: async (req, res) => {
        const { email } = req.body;

        if (await Accounts.findOne({ email })) {
            throw new Error('Conta já registrada.');
        }

        let account = await Accounts.create(req.body);

        account = account.toObject();

        const link = `${process.env.CLIENT_URL}/account/active/${account.code}`;

        delete account.password;
        delete account.code;

        const result = await Mail.sendMail({
            from: '"Novatics" <novatics@novatics.com>',
            to: email,
            subject: `Ativação da sua nova conta.`,
            template: 'activeAccount',
            context: { account: { email, link } }
        });

        return res.status(200).json(account);
    },
    active: async (req, res) => {
        const { code } = req.params;

        const account = await Accounts.findOneAndUpdate(
            { code },
            { $set: { status: 'actived' } },
            { new: true }
        );

        if (!account) {
            return res.status(400).json({ error: 'Código não econtrado ou inválido!' });
        }

        return res.status(200).json({ message: 'Código ativado' });
    },
    resend: async (req, res) => {
        const { email } = req.params;

        const account = await Accounts.findOne({ email, status: 'pending' });

        if (!account) {
            return res.status(400).json({ error: 'Cadastro não econtrado' });
        }

        account.link = `${process.env.CLIENT_URL}/account/active/${account.code}`;

        await Mail.sendMail({
            from: '"Novatics" <imob@gmail.com>',
            to: account.email,
            subject: `Ativação da sua nova conta.`,
            template: 'activeAccount',
            context: { account }
        });

        return res.status(200).json({ message: 'Email reenviado.' });
    },
    recovery: async (req, res) => {
        const { email } = req.params;

        const code = uuidv4();

        const account = await Accounts.findOneAndUpdate(
            { email },
            { $set: { code } },
            { new: true }
        );

        if (!account) {
            return res.status(400).json({ error: 'Cadastro não econtrado' });
        }

        const link = `${process.env.CLIENT_URL}/account/recovery/${code}`;

        await Mail.sendMail({
            from: '"Imob" <imob@gmail.com>',
            to: email,
            subject: `Recuperação de senha - Imob`,
            template: 'recoveryAccount',
            context: { account: { email, link } }
        });

        return res.status(200).json({ message: 'Email de recuperação de senha enviado.' });
    },
    changePassword: async (req, res) => {
        const { code, password } = req.body;

        const account = await Accounts.findOneAndUpdate(
            { code },
            { $set: { password: await bcrypt.hash(password, 8) } },
            { new: true }
        );

        if (!account) {
            return res.status(400).json({ error: 'Cadastro não econtrado' });
        }

        return res.status(200).json({ message: 'Senha alterada com sucesso.' });
    }
};

export default AccountController;
