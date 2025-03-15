// utils/transactions.js
const prisma = require("../../database/config");

const runInTransaction = async (callback) => {
  return await prisma.$transaction(async (tx) => {
    return await callback(tx);
  });
};

module.exports = { runInTransaction };
