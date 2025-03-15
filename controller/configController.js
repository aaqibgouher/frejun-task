const { HTTP_STATUS, MESSAGES } = require("../utils/constants");
const Output = require("../utils/output");
const configService = require("../services/configService");
const berthService = require("../services/berthService");

const getConfigs = async (req, res) => {
  try {
    const response = await configService.getConfigs();

    await Output.success(
      res,
      HTTP_STATUS.OK,
      MESSAGES.CONFIGS_GET_ALL_CONFIGS_SUCCESS,
      response
    );
  } catch (error) {
    console.log(error, "from error");
    await Output.error(res, HTTP_STATUS.BAD_REQUEST, error);
  }
};

const addConfig = async (req, res) => {
  try {
    // add config & births
    const response = await configService.addConfig({});

    await Output.success(
      res,
      HTTP_STATUS.OK,
      MESSAGES.CONFIGS_ADD_CONFIG_SUCCESS,
      response
    );
  } catch (error) {
    console.log(error, "from error");
    await Output.error(res, HTTP_STATUS.BAD_REQUEST, error);
  }
};

module.exports = {
  getConfigs,
  addConfig,
};
