const transactionUtil = require("../utils/transactions");
const ticketValidator = require("../utils/validations/ticketValidator");
const configService = require("./configService");
const ticketRepository = require("../repositories/ticketRepositories");
const commonUtils = require("../utils/common");
const passengerService = require("./passengerService");
const {
  PASSENGER_STATUS,
  TICKET_STATUS,
  BERTH_STATUS,
} = require("../utils/constants");
const berthService = require("./berthService");
const passengerBerthService = require("./passengerBerthService");

const getTicket = async (payload = {}, masterTx = null) => {
  let activeTx = masterTx ? masterTx : null;

  return await ticketRepository.getOne(payload, activeTx);
};

const addTicket = async (payload = {}, masterTx = null) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      const { status } = payload;

      return await ticketRepository.add(
        {
          pnr: await generatePNR(),
          status,
        },
        activeTx
      );
    } catch (error) {
      console.log("Erro: ticketService - bookTickets", error);
      throw error;
    }
  });
};

const bookTickets = async (payload = {}) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    try {
      // validation
      const { error, value } = ticketValidator.bookingSchema.validate(payload, {
        abortEarly: false,
      });

      // if error, throw
      if (error) {
        throw error.details[0];
      }

      // desctructure
      const { totalBooking, passengers, isRac, isWL } = payload;
      let ticket, passengersInfo, response;

      // get configs
      const configs = await configService.getConfigs();
      const config = configs[0];
      const availableCount =
        config.total_confirmed_berths_config -
        config.total_confirmed_berths -
        config.total_rac_berths_config;

      // if confirmed ticket available
      if (totalBooking <= availableCount) {
        // 1. create ticket
        ticket = await addTicket({ status: TICKET_STATUS.FULLY_CONFIRMED }, tx);

        // 2. create passengers
        const passengersWithStataus = passengers.map((p) => ({
          ...p,
          status:
            p.age < 5 ? PASSENGER_STATUS.NO_BERTH : PASSENGER_STATUS.CONFIRMED,
        }));

        const passengersCount = await passengerService.addPassengers(
          { ticketId: ticket.id, passengers: passengersWithStataus },
          tx
        );

        passengersInfo = await passengerService.getPassengers(
          {
            where: { ticket_id: ticket.id },
          },
          tx
        );

        // 3. allocate berths
        response = await berthService.allocateBerths(
          { passengers: passengersInfo, limit: 1 },
          tx
        );

        // 6. update total count in configs
        await configService.updateConfig(
          { id: config.id },
          {
            total_confirmed_berths:
              config.total_confirmed_berths + response.adultCount,
          }
        );
      } else if (availableCount) {
        throw `Only ${availableCount} confirmed berths available, please book it first then book RAC`;
      } else if (!isRac && !isWL) {
        throw `No confirmed seats available, Enable RAC booking to proceed.`;
      } else if (isRac && !isWL) {
        const availableRac =
          config.total_rac_berths_config * 2 - config.total_rac_berths;
        if (totalBooking <= availableRac) {
          // 1. create ticket
          ticket = await addTicket(
            { status: TICKET_STATUS.PARTIALLY_CONFIRMED },
            tx
          );

          // 2. create passengers
          const passengersWithStataus = passengers.map((p) => ({
            ...p,
            status:
              p.age < 5 ? PASSENGER_STATUS.NO_BERTH : PASSENGER_STATUS.RAC,
          }));
          const passengersCount = await passengerService.addPassengers(
            { ticketId: ticket.id, passengers: passengersWithStataus },
            tx
          );

          passengersInfo = await passengerService.getPassengers(
            {
              where: { ticket_id: ticket.id },
            },
            tx
          );

          // 3. allocate berths
          response = await berthService.allocateBerths(
            { passengers: passengersInfo, limit: 1, isRac: true },
            tx
          );

          // 4. update total count in configs
          await configService.updateConfig(
            { id: config.id },
            {
              total_rac_berths: config.total_rac_berths + response.adultCount,
            }
          );
        } else if (!availableRac)
          throw "No RAC berths available, Enable WL booking to proceed.";
        else {
          throw `Only ${availableRac} RAC berths available, Hurry up!`;
        }
      } else if (!isRac && isWL) {
        const availableWL =
          config.total_waiting_list_berths_config -
          config.total_waiting_list_berths;

        if (totalBooking <= availableWL) {
          // 1. create ticket
          ticket = await addTicket({ status: TICKET_STATUS.PENDING }, tx);

          // 2. create passengers
          const passengersWithStataus = passengers.map((p) => ({
            ...p,
            status:
              p.age < 5
                ? PASSENGER_STATUS.NO_BERTH
                : PASSENGER_STATUS.WAITLISTED,
          }));
          const passengersCount = await passengerService.addPassengers(
            { ticketId: ticket.id, passengers: passengersWithStataus },
            tx
          );

          passengersInfo = await passengerService.getPassengers(
            {
              where: { ticket_id: ticket.id },
            },
            tx
          );

          let childCount = 0;
          let adultCount = 0;
          for (const passenger of passengers) {
            if (passenger.age < 5) {
              childCount++;
            } else {
              adultCount++;
            }
          }

          // 6. update total count in configs
          await configService.updateConfig(
            { id: config.id },
            {
              total_waiting_list_berths:
                config.total_waiting_list_berths + adultCount,
            }
          );

          response = { allocatedBerths: [] };
        } else throw "No tickets available";
      }

      if (!response) throw "No berth allocated, something went wrong";

      return {
        ticket,
        passengersInfo: passengersInfo,
        berthInfo: response.allocatedBerths,
      };
    } catch (error) {
      console.log("Erro: ticketService - bookTickets", error);
      throw error;
    }
  });
};

const cancelTicket = async (payload = {}, masterTx = null) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      const { pnr } = payload;

      // 1. get ticket by pnr
      const ticket = await getTicket({ where: { pnr } }, activeTx);

      // allowing only confirmed ticket to be cancelled
      if (ticket.status !== TICKET_STATUS.FULLY_CONFIRMED)
        throw "Sorry, we are only allowing FULLY CONFIRMED tickets to be cancelled";

      // 2. Get passengers under this ticket
      const passengers = await passengerService.getPassengers(
        { where: { ticket_id: ticket.id } },
        activeTx
      );

      if (!passengers.length) throw "No passengers found for this ticket";

      const passengerIds = passengers.map((p) => p.id);

      // 3. Cancel passengers
      await passengerService.updatePassengers(
        { ticket_id: ticket.id },
        { status: PASSENGER_STATUS.CANCELLED },
        activeTx
      );

      // 4. Cancel ticket
      await updateTicket(
        { id: ticket.id },
        { status: TICKET_STATUS.CANCELLED },
        activeTx
      );

      // 5. Get berth mappings for passengers
      const passengerBerths = await passengerBerthService.getPassengerBerths(
        { where: { passenger_id: { in: passengerIds } } },
        activeTx
      );
      const berthIds = passengerBerths.map((pb) => pb.berth_id);

      // 6. Update berth status to AVAILABLE
      await berthService.updateBerths(
        { id: { in: berthIds } },
        { berth_status: BERTH_STATUS.AVAILABLE },
        activeTx
      );

      // 7. Delete mappings from passenger_berths
      await passengerBerthService.deletePassengerBerths(
        { passenger_id: { in: passengerIds } },
        activeTx
      );

      // 8. Update Config - increment available confirmed berths
      const config = (await configService.getConfigs())[0];
      await configService.updateConfig(
        { id: config.id },
        {
          total_confirmed_berths:
            config.total_confirmed_berths - passengerIds.length,
        },
        activeTx
      );

      return passengerIds;
    } catch (error) {
      console.log("Erro: ticketService - cancelTicket", error);
      throw error;
    }
  });
};

const getBookedTickets = async (payload = {}, masterTx = null) => {
  const { pnr } = payload;

  const ticket = await ticketRepository.findTicketByPNR(pnr);

  if (!ticket) throw "Ticket not found with this PNR";

  return ticket;
};

const getAvailableTickets = async (payload = {}, masterTx = null) => {
  const configs = await configService.getConfigs();
  const config = configs[0];
  const availableCount =
    config.total_confirmed_berths_config -
    config.total_confirmed_berths -
    config.total_rac_berths_config;
  const racCount = config.total_rac_berths_config * 2 - config.total_rac_berths;
  const waitingCount =
    config.total_waiting_list_berths_config - config.total_waiting_list_berths;

  // confirmed ticket
  if (availableCount)
    return `Hurry up, we have only ${availableCount} berths available`;

  // rac ticket
  if (racCount)
    return `Oops, no confirmed berths available. Hurry up, only ${racCount} RAC berths available`;

  // wl ticket
  if (waitingCount)
    return `Oops, no Confirmed && RAC berths available. Give a try on waitling list, only ${waitingCount} Waiting berths available`;
};

const updateTicket = async (
  condition = {},
  dataToUpdate = {},
  masterTx = null
) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      return await ticketRepository.updateOne(
        condition,
        dataToUpdate,
        activeTx
      );
    } catch (error) {
      console.log("Erro: ticketService - updateTicket", error);
      throw error;
    }
  });
};

const generatePNR = async () => {
  let pnr;
  let isUnique = false;

  while (!isUnique) {
    pnr = commonUtils.generatePNR();

    const ticket = await ticketRepository.getOne({
      where: { pnr },
    });

    if (!ticket) {
      isUnique = true;
    }
  }

  return pnr;
};

module.exports = {
  bookTickets,
  getBookedTickets,
  getAvailableTickets,
  cancelTicket,
  getTicket,
  updateTicket,
};
