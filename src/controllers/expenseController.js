const Expense = require("../models/expenseModel");
const { createExpenseSchema, updateExpenseSchema } = require("../validations/expenseValidation");

/**
 * Helper: padroniza respostas de validação
 */
function validate(schema, data) {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message);
    const err = new Error(details.join("; "));
    err.status = 400;
    throw err;
  }
  return value;
}

/**
 * POST /api/expenses
 * Cria uma despesa
 */
exports.createExpense = async (req, res) => {
  try {
    const valid = validate(createExpenseSchema, req.body);
    const expense = await Expense.create(valid); // cria e salva
    res.status(201).json(expense);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

/**
 * GET /api/expenses
 * Lista todas as despesas (pode filtrar por mês/ano)
 * Query: ?mes=8&ano=2025
 */
exports.getExpenses = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    let filter = {};

    // Filtro por intervalo de datas, útil para relatórios mensais
    if (mes && ano) {
      const start = new Date(ano, mes - 1, 1);
      const end = new Date(ano, mes, 0, 23, 59, 59, 999);
      filter.data = { $gte: start, $lte: end };
    }

    const expenses = await Expense.find(filter).sort({ data: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/expenses/:id
 * Retorna uma despesa
 */
exports.getExpenseById = async (req, res) => {
  try {
    const doc = await Expense.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Despesa não encontrada" });
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: "ID inválido" });
  }
};

/**
 * PUT /api/expenses/:id
 * Atualiza uma despesa
 */
exports.updateExpense = async (req, res) => {
  try {
    const valid = validate(updateExpenseSchema, req.body);
    const updated = await Expense.findByIdAndUpdate(req.params.id, valid, {
      new: true, // retorna o documento já atualizado
      runValidators: true, // aplica validações do schema Mongoose
    });
    if (!updated) return res.status(404).json({ message: "Despesa não encontrada" });
    res.json(updated);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

/**
 * DELETE /api/expenses/:id
 * Remove uma despesa
 */
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Despesa não encontrada" });
    res.json({ message: "Despesa removida com sucesso" });
  } catch (err) {
    res.status(400).json({ message: "ID inválido" });
  }
};
