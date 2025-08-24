// src/config/db.js
const mongoose = require("mongoose");

// Função para conectar ao MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB conectado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao conectar no MongoDB:", err.message);
    process.exit(1); // Encerra o processo caso falhe
  }
};

module.exports = connectDB;
