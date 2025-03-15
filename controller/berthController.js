const berthService = require("../services/berthService");
const { HTTP_STATUS, MESSAGES } = require("../utils/constants");
const Output = require("../utils/output");

const getBerths = async (req, res) => {
  try {
    const response = await berthService.getBerths();

    await Output.success(
      res,
      HTTP_STATUS.OK,
      MESSAGES.BERTHS_GET_ALL_BERTHS_SUCCESS,
      response
    );
  } catch (error) {
    console.log(error, "from error");
    await Output.error(res, HTTP_STATUS.BAD_REQUEST, error);
  }
};

module.exports = {
  getBerths,
};
