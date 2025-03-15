const prisma = require("../database/config");

const getMany = async (payload = {}) => {
  return await prisma.config.findMany();
};

const add = async (payload = {}, transaction) => {
  return await transaction.config.create({ data: payload });
};

const updateOne = async (condition = {}, dataToUpdate = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.config.update({
    where: condition,
    data: dataToUpdate,
  });
};

module.exports = {
  getMany,
  add,
  updateOne,
};
