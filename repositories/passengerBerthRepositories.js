const prisma = require("../database/config");

const getMany = async (payload = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.passengerBerth.findMany(payload);
};

const add = async (payload = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.passengerBerth.create({ data: payload });
};

const deleteMany = async (condition = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.passengerBerth.deleteMany({
    where: condition,
  });
};

module.exports = {
  add,
  getMany,
  deleteMany,
};
