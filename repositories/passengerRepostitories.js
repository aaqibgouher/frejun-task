const prisma = require("../database/config");

const addMany = async (payload = {}, transaction) => {
  return await transaction.passenger.createMany({ data: payload });
};

const getMany = async (payload = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.passenger.findMany(payload);
};

const updateMany = async (condition = {}, dataToUpdate = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.passenger.updateMany({
    where: condition,
    data: dataToUpdate,
  });
};

module.exports = {
  addMany,
  getMany,
  updateMany,
};
