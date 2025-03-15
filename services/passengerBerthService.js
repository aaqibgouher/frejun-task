const transactionUtil = require("../utils/transactions");
const passengerBerthValidator = require("../utils/validations/passengerBerthValidator");
const passengerBerthRepositories = require("../repositories/passengerBerthRepositories");

const getPassengerBerths = async (payload = {}, masterTx = null) => {
  let activeTx = masterTx ? masterTx : null;

  return await passengerBerthRepositories.getMany(payload, activeTx);
};

const addPassengerBerth = async (payload = {}, masterTx = null) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      // validation
      const { error, value } =
        passengerBerthValidator.addPassengerBerthSchema.validate(payload, {
          abortEarly: false,
        });

      // if error, throw
      if (error) {
        throw error.details[0];
      }

      const { berthId, passengerId } = payload;

      await passengerBerthRepositories.add(
        { berth_id: berthId, passenger_id: passengerId },
        activeTx
      );
    } catch (error) {
      console.log("Erro: passengerBerthService - addPassengerBerth", error);
      throw error;
    }
  });
};

const deletePassengerBerths = async (condition = {}, masterTx = null) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      return await passengerBerthRepositories.deleteMany(condition, activeTx);
    } catch (error) {
      console.log("Erro: passengerService - addPassengers", error);
      throw error;
    }
  });
};

module.exports = {
  getPassengerBerths,
  addPassengerBerth,
  deletePassengerBerths,
};
