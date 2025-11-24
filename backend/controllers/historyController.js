const { User } = require("../../database/userModel");

// salvar histórico individual
exports.saveHistory = async (req, res) => {
    try {
        const { email, imageData } = req.body;
        if (!email || !imageData) {
            return res.status(400).json({ error: "E-mail e dados da imagem são obrigatórios" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

        await User.updateOne(
            { email },
            { $push: { history: imageData } }
        );

        res.json({ success: true, message: "Histórico salvo com sucesso" });
    } catch (err) {
        console.error("Erro ao salvar histórico:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// rota pra retornar o histórico de imagens do usuário
exports.getHistory = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

        res.json({ success: true, history: user.history });
    } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// ESTATÍSTICAS
exports.getStats = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "E-mail é obrigatório." });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "Usuário não encontrado." });

        const history = user.history || [];

        // total de imagens
        const totalImages = history.length;

        // tempo médio simulado (exemplo)
        const avgTime = totalImages > 0 ? (Math.random() * 10 + 5).toFixed(1) : 0;

        // palavra mais comum dos prompts
        let wordCount = {};
        history.forEach(entry => {
            if (entry.prompt) {
                const words = entry.prompt.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 3) {
                        wordCount[word] = (wordCount[word] || 0) + 1;
                    }
                });
            }
        });
        const popularWord = Object.keys(wordCount).length > 0
            ? Object.entries(wordCount).sort((a, b) => b[1] - a[1])[0][0]
            : "Nenhum";

        res.json({
            success: true,
            totalImages,
            avgTime,
            popularWord
        });
    } catch (err) {
        console.error("Erro ao gerar estatísticas:", err);
        res.status(500).json({ success: false, message: "Erro interno no servidor." });
    }
};