const express = require("express");
const router = express.Router();
const { splitByParticipants, sendMonthlyEmail } = require("../controllers/reportController");

// Divisão por participantes + envio de e-mail com resumo
router.get("/dividir", splitByParticipants);
router.post("/email", sendMonthlyEmail);

module.exports = router;
