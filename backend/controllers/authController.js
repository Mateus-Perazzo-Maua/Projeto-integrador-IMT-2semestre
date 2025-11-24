const { User } = require("../../database/userModel");
const bcrypt = require("bcrypt");

// rota de registro
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Preencha todos os campos!" });
    }

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            return res.status(400).json({ message: "Usuário ou e-mail já cadastrado!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();

        res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        console.error("Erro ao registrar:", err);
        res.status(500).json({ message: "Erro ao registrar usuário", error: err.message });
    }
};

// rota de login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Preencha todos os campos!" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "E-mail não encontrado" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Senha incorreta" });
        }

        res.status(200).json({ message: "Login realizado com sucesso!" });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};