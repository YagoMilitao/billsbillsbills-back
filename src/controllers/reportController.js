/**
 * Controller responsável por:
 * - Calcular a divisão das despesas por participantes
 * - Enviar um resumo por e-mail
 */
const Expense = require("../models/expenseModel");
const nodemailer = require("nodemailer");

/**
 * GET /api/report/dividir?mes=8&ano=2025&participantes=a@x.com,b@y.com
 * Retorna quanto cada participante deve pagar no mês/ano selecionado
 */
exports.splitByParticipants = async (req, res) => {
  try {
    const { mes, ano, participantes } = req.query;

    if (!mes || !ano) {
      return res.status(400).json({ message: "Informe mes e ano (ex: ?mes=8&ano=2025)" });
    }

    // Participantes podem vir no querystring ou ser inferidos dos gastos
    let listaParticipantes = [];
    if (participantes) {
      listaParticipantes = participantes.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const start = new Date(ano, mes - 1, 1);
    const end = new Date(ano, mes, 0, 23, 59, 59, 999);

    const despesas = await Expense.find({ data: { $gte: start, $lte: end } });

    // Se não foi passado participantes, pegue de todas as despesas
    if (!listaParticipantes.length) {
      const set = new Set();
      despesas.forEach((d) => d.participantes.forEach((p) => set.add(p)));
      listaParticipantes = Array.from(set);
    }
    if (!listaParticipantes.length) {
      return res.status(400).json({ message: "Sem participantes definidos para dividir" });
    }

    // Soma total e divide igualmente entre participantes
    const total = despesas.reduce((acc, d) => acc + d.valor, 0);
    const porPessoa = total / listaParticipantes.length;

    // Também gera um breakdown por categoria (útil no e-mail)
    const porCategoria = despesas.reduce((acc, d) => {
      acc[d.categoria] = (acc[d.categoria] || 0) + d.valor;
      return acc;
    }, {});

    res.json({
      periodo: { mes: Number(mes), ano: Number(ano) },
      total,
      participantes: listaParticipantes,
      valorPorPessoa: Number(porPessoa.toFixed(2)),
      porCategoria,
      quantidadeDespesas: despesas.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/report/email
 * Body: { mes, ano, destinatarios: ["a@x.com","b@y.com"] }
 * Envia o resumo por email usando SMTP do .env
 */
exports.sendMonthlyEmail = async (req, res) => {
  try {
    const { mes, ano, destinatarios } = req.body;
    if (!mes || !ano || !Array.isArray(destinatarios) || !destinatarios.length) {
      return res.status(400).json({ message: "Informe mes, ano e destinatarios[]" });
    }

    // Busca despesas do período
    const start = new Date(ano, mes - 1, 1);
    const end = new Date(ano, mes, 0, 23, 59, 59, 999);
    const despesas = await Expense.find({ data: { $gte: start, $lte: end } });

    const total = despesas.reduce((acc, d) => acc + d.valor, 0);
    const porCategoria = despesas.reduce((acc, d) => {
      acc[d.categoria] = (acc[d.categoria] || 0) + d.valor;
      return acc;
    }, {});

    // Monta HTML simples
    const html = `
      <h2>Resumo de Gastos - ${mes}/${ano}</h2>
      <p><strong>Total:</strong> R$ ${total.toFixed(2)}</p>
      <p><strong>Por categoria:</strong></p>
      <ul>
        ${Object.entries(porCategoria).map(([cat, v]) => `<li>${cat}: R$ ${v.toFixed(2)}</li>`).join("")}
      </ul>
      <p>Quantidade de despesas: ${despesas.length}</p>
    `;

    // Configura transporte SMTP via variáveis de ambiente.
    // Dica: para grátis, use Mailtrap (sandbox) ou Gmail com App Password.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,      // ex: smtp.gmail.com (com App Password) ou sandbox Mailtrap
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || `"Gastos Mensais" <no-reply@gastosmensais.app>`,
      to: destinatarios.join(","),
      subject: `Resumo de Gastos ${mes}/${ano}`,
      html,
    });

    res.json({ message: "E-mail enviado", id: info.messageId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
