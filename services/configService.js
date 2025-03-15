const configRepository = require("../repositories/configRepositories");
const { MESSAGES } = require("../utils/constants");
const transactionUtil = require("../utils/transactions");
const berthService = require("./berthService");
const configValidator = require("../utils/validations/configValidator");

const getConfigs = async (payload = {}) => {
  return await configRepository.getMany(payload);
};

const addConfig = async (payload = {}) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    try {
      // get all configs
      const configs = await getConfigs();

      // if already present, throw error
      if (configs?.length) throw MESSAGES.CONFIGS_CONFIG_ALREADY_EXISTS;

      const configRes = await configRepository.add(payload, tx);
      const berthRes = await berthService.addBerths(configRes, tx);

      return { configRes, berthRes };
    } catch (error) {
      console.log("Erro: configService - addConfig", error);
      throw error;
    }
  });
};

const updateConfig = async (
  condition = {},
  dataToUpdate = {},
  masterTx = null
) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      // validation
      const { error, value } = configValidator.updateConfigSchema.validate(
        dataToUpdate,
        {
          abortEarly: false,
        }
      );

      // if error, throw
      if (error) {
        throw error.details[0];
      }

      // Perform update
      const updatedConfig = await configRepository.updateOne(
        condition,
        dataToUpdate,
        activeTx
      );

      return updatedConfig;
    } catch (error) {
      console.log("Error: configService - updateConfig", error);
      throw error;
    }
  });
};

module.exports = {
  getConfigs,
  addConfig,
  updateConfig,
};
