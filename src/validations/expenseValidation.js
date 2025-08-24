const Joi = require("joi");

/**
 * JOI valida o shape do body:
 * - Protege a API de entradas inválidas
 * - Mensagens ficam claras e padronizadas
 */
const base = {
  descricao: Joi.string().min(2).max(100).required(),
  valor: Joi.number().positive().precision(2).required(),
  categoria: Joi.string().valid("basico", "lazer", "outros").required(),
  data: Joi.date().optional(),
  participantes: Joi.array().items(Joi.string().email()).optional(),
};

exports.createExpenseSchema = Joi.object(base);

exports.updateExpenseSchema = Joi.object({
  descricao: base.descricao.optional(),
  valor: base.valor.optional(),
  categoria: base.categoria.optional(),
  data: base.data.optional(),
  participantes: base.participantes.optional(),
}).min(1); // garante que há ao menos um campo a atualizar
