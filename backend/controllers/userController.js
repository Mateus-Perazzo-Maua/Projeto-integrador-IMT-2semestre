const { User } = require("../../database/userModel");
const bcrypt = require("bcrypt");

// obter informações do usuário
exports.getUserInfo = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "E-mail é obrigatório" });
        }

        const user = await User.findOne({ email }).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado" });
        }

        res.json({
            success: true,
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
};

// atualizar informações do usuário
exports.updateUser = async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).json({ success: false, message: "E-mail e nome de usuário são obrigatórios" });
        }

        // verificar se o novo username já existe (menos pro próprio usuário)
        const existingUser = await User.findOne({ username, email: { $ne: email } });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "Este nome de usuário já está em uso" });
        }

        const result = await User.updateOne(
            { email },
            { $set: { username } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado ou nenhuma alteração feita" });
        }

        res.json({ success: true, message: "Informações atualizadas com sucesso" });
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
};

// atualizar senha
exports.updatePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado" });
        }

        // verificar se a senha atual está correta
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Senha atual incorreta" });
        }

        // gerar hash da nova senha
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        // atualizar senha no banco
        const result = await User.updateOne(
            { email },
            { $set: { password: newHashedPassword } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json({ success: false, message: "Erro ao atualizar senha" });
        }

        res.json({ success: true, message: "Senha atualizada com sucesso" });
    } catch (err) {
        console.error("Erro ao atualizar senha:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
};

// excluir conta
exports.deleteAccount = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado" });
        }

        // verificar senha
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Senha incorreta" });
        }

        // excluir usuário
        const result = await User.deleteOne({ email });

        if (result.deletedCount === 0) {
            return res.status(500).json({ success: false, message: "Erro ao excluir conta" });
        }

        res.json({ success: true, message: "Conta excluída com sucesso" });
    } catch (err) {
        console.error("Erro ao excluir conta:", err);
        res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
};

// buscar perfil do usuário
exports.getUserProfile = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "E-mail é obrigatório"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        // retornar dados necessários
        res.json({
            success: true,
            user: {
                username: user.username,
                email: user.email,
                createdAt: user.createdAt || new Date()
            }
        });

    } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        res.status(500).json({
            success: false,
            message: "Erro interno do servidor",
            error: err.message
        });
    }
};