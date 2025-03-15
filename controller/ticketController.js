const { HTTP_STATUS, MESSAGES } = require("../utils/constants");
const Output = require("../utils/output");
const ticketService = require("../services/ticketService");

const bookTickets = async (req, res) => {
  try {
    const response = await ticketService.bookTickets(req.body);

    await Output.success(
      res,
      HTTP_STATUS.OK,
      MESSAGES.TICKETS_ADD_TICKET_SUCCESS,
      response
    );
  } catch (error) {
    console.log(error, "from error");
    await Output.error(res, HTTP_STATUS.BAD_REQUEST, error);
  }
};

const getBookedTickets = async (req, res) => {
  try {
    const { pnr } = req.query;

    const response = await ticketService.getBookedTickets({ pnr });

    await Output.success(
      res,
      HTTP_STATUS.OK,
      MESSAGES.TICKETS_GET_BOOKED_TICKETS_SUCCESS,
      response
    );
  } catch (error) {
    console.log(error, "from error");
    await Output.error(res, HTTP_STATUS.BAD_REQUEST, error);
  }
};

const getAvailableTickets = async (req, res) => {
  try {
    const response = await ticketService.getAvailableTickets({});

    await Output.success(
      res,
      HTTP_STATUS.OK,
      MESSAGES.TICKETS_GET_AVAILABLE_TICKETS_SUCCESS,
      response
    );
  } catch (error) {
    console.log(error, "from error");
    await Output.error(res, HTTP_STATUS.BAD_REQUEST, error);
  }
};

const cancelTicket = async (req, res) => {
  try {
    const { pnr } = req.params;
    const response = await ticketService.cancelTicket({ pnr });

    await Output.success(
      res,
      HTTP_STATUS.OK,
      MESSAGES.TICKETS_CANCEL_TICKET_SUCCESS,
      response
    );
  } catch (error) {
    console.log(error, "from error");
    await Output.error(res, HTTP_STATUS.BAD_REQUEST, error);
  }
};

module.exports = {
  bookTickets,
  getBookedTickets,
  getAvailableTickets,
  cancelTicket,
};
