/* ************* HTTP STATUS CONSTANT *********** */
const HTTP_STATUS = {
  // Success responses
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client error responses
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server error responses
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
};

/* ************* MESSAGES CONSTANT *********** */
const MESSAGES = {
  // Configs
  CONFIGS_GET_ALL_CONFIGS_SUCCESS: "Successfully get configs",
  CONFIGS_ADD_CONFIG_SUCCESS: "Successfully added config",
  CONFIGS_CONFIG_ALREADY_EXISTS: "Config already exist",

  // Berths
  BERTHS_GET_ALL_BERTHS_SUCCESS: "Successfully get berths",

  // Tickets
  TICKETS_ADD_TICKET_SUCCESS: "Successfully booked ticket/s",
  TICKETS_GET_BOOKED_TICKETS_SUCCESS: "Successfully get booked ticket",
  TICKETS_GET_AVAILABLE_TICKETS_SUCCESS: "Successfully get available ticket",
  TICKETS_CANCEL_TICKET_SUCCESS: "Successfully cancelled confirmed tickets",
};

/* ************* BIRTH TYPE CONSTANT *********** */
const BERTH_TYPE = {
  LB: "LB",
  MB: "MB",
  UB: "UB",
  SL: "SL",
  SU: "SU",
};

/* ************* BIRTH TYPE ARR CONSTANT *********** */
const BERTH_TYPE_ARR = ["LB", "MB", "UB", "LB", "MB", "UB", "SL", "SU"];

/* ************* BIRTH STATUS CONSTANT *********** */
const BERTH_STATUS = {
  RAC: "RAC",
  CONFIRMED: "CONFIRMED",
  AVAILABLE: "AVAILABLE",
};

/* ************* TICKET STATUS CONSTANT *********** */
const TICKET_STATUS = {
  PENDING: "PENDING",
  PARTIALLY_CONFIRMED: "PARTIALLY_CONFIRMED",
  FULLY_CONFIRMED: "FULLY_CONFIRMED",
  CANCELLED: "CANCELLED",
};

/* ************* PASSENGER STATUS CONSTANT *********** */
const PASSENGER_STATUS = {
  RAC: "RAC",
  CONFIRMED: "CONFIRMED",
  WAITLISTED: "WAITLISTED",
  CANCELLED: "CANCELLED",
  NO_BERTH: "NO_BERTH",
};

/* ************* GENDER CONSTANT *********** */
const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
};

module.exports = {
  HTTP_STATUS,
  MESSAGES,
  BERTH_TYPE,
  BERTH_TYPE_ARR,
  BERTH_STATUS,
  TICKET_STATUS,
  PASSENGER_STATUS,
  GENDER,
};
