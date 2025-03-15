const transactionUtil = require("../utils/transactions");
const passengerValidator = require("../utils/validations/passengerValidator");
const passengerRepositories = require("../repositories/passengerRepostitories");
const prisma = require("../database/config");

const getPassengers = async (payload = {}, masterTx = null) => {
  let activeTx = masterTx ? masterTx : null;

  return await passengerRepositories.getMany(payload, activeTx);
};

const addPassengers = async (payload = {}, masterTx = null) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      // validation
      const { error, value } = passengerValidator.addPassengersSchema.validate(
        payload,
        {
          abortEarly: false,
        }
      );

      // if error, throw
      if (error) {
        throw error.details[0];
      }

      const { ticketId, passengers } = payload;

      const passengersToCreate = passengers.map((passenger) => {
        return {
          ticket_id: ticketId,
          name: passenger.name,
          age: passenger.age,
          gender: passenger.gender,
          status: passenger.status,
          with_child: passenger?.withChild,
        };
      });

      return await passengerRepositories.addMany(passengersToCreate, activeTx);
    } catch (error) {
      console.log("Erro: passengerService - addPassengers", error);
      throw error;
    }
  });
};

const updatePassengers = async (
  condition = {},
  dataToUpdate = {},
  masterTx = null
) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      return await passengerRepositories.updateMany(
        condition,
        dataToUpdate,
        activeTx
      );
    } catch (error) {
      console.log("Erro: passengerService - addPassengers", error);
      throw error;
    }
  });
};

module.exports = {
  addPassengers,
  getPassengers,
  updatePassengers,
};
