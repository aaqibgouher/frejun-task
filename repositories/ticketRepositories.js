const prisma = require("../database/config");

const getOne = async (payload = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.ticket.findFirst(payload);
};

const add = async (payload = {}, transaction) => {
  return await transaction.ticket.create({ data: payload });
};

const findTicketByPNR = async (pnr) => {
  return await prisma.ticket.findUnique({
    where: { pnr },
    include: {
      passengers: {
        include: {
          berths: {
            include: {
              berth: true, // Join with Berths table to get full berth details
            },
          },
        },
      },
    },
  });
};

const updateOne = async (condition = {}, dataToUpdate = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.ticket.update({
    where: condition,
    data: dataToUpdate,
  });
};

module.exports = {
  getOne,
  add,
  findTicketByPNR,
  updateOne,
};
