// src/models/expenseModel.js
const mongoose = require("mongoose");

// Estrutura de um gasto
const expenseSchema = new mongoose.Schema(
 {
    descricao: { type: String, required: true, trim: true },
    valor: { type: Number, required: true, min: 0 },
    categoria: {
      type: String,
      enum: ["basico", "lazer", "outros"],
      required: true,
    },
    data: { type: Date, default: Date.now },
    participantes: { type: [String], default: [] } // e-mails
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);

module.exports = mongoose.model("Expense", expenseSchema);
