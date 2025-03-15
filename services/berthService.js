const {
  BERTH_TYPE_ARR,
  BERTH_STATUS,
  GENDER,
  BERTH_TYPE,
  PASSENGER_STATUS,
} = require("../utils/constants");
const berthRepositories = require("../repositories/berthRepositories");
const transactionUtil = require("../utils/transactions");
const passengerBerthService = require("./passengerBerthService");

const getBerths = async (payload = {}, masterTx = null) => {
  let activeTx = masterTx ? masterTx : null;

  return await berthRepositories.getMany(payload, activeTx);
};

const addBerths = async (payload = {}, masterTx = null) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : null;

    try {
      const { total_confirmed_berths_config: totalConfirmedBerthsConfig } =
        payload;
      const berthsToCreate = [];

      for (let i = 1; i <= totalConfirmedBerthsConfig; i++) {
        berthsToCreate.push({
          berth_no: i,
          berth_type: getBerthType(i),
          berth_status: BERTH_STATUS.AVAILABLE,
        });
      }

      return await berthRepositories.addMany(berthsToCreate, activeTx);
    } catch (error) {
      console.log("Erro: berthService - addBerths", error);
      throw error;
    }
  });
};

const getBerthType = (index) => {
  const types = BERTH_TYPE_ARR;
  return types[(index - 1) % 8]; // (index - 1) because loop starts from 1
};

const allocateBerths = async (payload = {}, masterTx = null) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      const { passengers, limit, isRac } = payload;

      let allocatedBerths = [];
      let childCount = 0;
      let adultCount = 0;

      // Count adults and children first
      for (const passenger of passengers) {
        if (passenger.age < 5) {
          childCount++;
        } else {
          adultCount++;
        }
      }

      // If only children under 5, throw error
      if (childCount > 0 && adultCount === 0) {
        throw "Children under 5 cannot book alone. At least one adult is required.";
      }

      for (const passenger of passengers) {
        // If passenger is under 5, no berth allocation but store info
        if (passenger.age < 5) {
          allocatedBerths.push({
            passenger_id: passenger.id,
            passenger_name: passenger.name,
            passenger_age: passenger.age,
            passenger_gender: passenger.gender,
            berth_id: null,
            coach_no: null,
            berth_no: null,
            berth_type: null,
            berth_status: PASSENGER_STATUS.NO_BERTH,
          });

          console.log(
            `Passenger ${passenger.name} is under 5, no berth allocated.`
          );

          continue; // Skip berth allocation for children under 5
        }

        if (isRac) {
          // get available rac berth
          const availableRacBerths = await berthRepositories.getAvailableBerth(
            activeTx
          );

          const availableRacBerth = availableRacBerths[0];
          const passengerCount = Number(availableRacBerth.passenger_count);

          // if 0, change berth status to RAC
          if (passengerCount == 0) {
            await berthRepositories.updateOne(
              { id: availableRacBerth.id },
              { berth_status: BERTH_STATUS.RAC }
            );
          }

          // add passenger & berth mapping
          await passengerBerthService.addPassengerBerth(
            {
              berthId: availableRacBerth.id,
              passengerId: passenger.id,
            },
            activeTx
          );

          allocatedBerths.push({
            passenger_id: passenger.id,
            passenger_name: passenger.name,
            passenger_age: passenger.age,
            passenger_gender: passenger.gender,
            berth_id: availableRacBerth.id,
            coach_no: availableRacBerth.coach_no,
            berth_no: availableRacBerth.berth_no,
            berth_type: availableRacBerth.berth_type,
            berth_status: BERTH_STATUS.RAC, // Should be RAC status
          });

          continue;
        } else {
          let preferredBerthType = null,
            preferredFlag = false;

          // Priority 1: Senior Citizens (60+)
          if (passenger.age >= 60) {
            preferredBerthType = BERTH_TYPE.LB;
            preferredFlag = true;
          }
          // Priority 2: Women with children
          else if (
            passenger.gender === GENDER.FEMALE &&
            passenger?.with_child
          ) {
            preferredBerthType = BERTH_TYPE.LB;
            preferredFlag = true;
          }

          let berth = null;

          // First try to get preferred berth type
          if (preferredFlag) {
            const preferredBerths = await getBerths(
              {
                where: {
                  berth_status: BERTH_STATUS.AVAILABLE,
                  berth_type: preferredBerthType,
                },
                orderBy: { berth_no: "asc" },
                take: limit,
              },
              activeTx
            );

            berth = preferredBerths[0] || null; // Pick first preferred berth if available
          }

          // If preferred berth is not available, fetch any available berth
          if (!berth) {
            const availableBerths = await getBerths(
              {
                where: {
                  AND: [
                    { berth_status: "AVAILABLE" },
                    { NOT: { berth_type: "SL" } },
                  ],
                },
                orderBy: { berth_no: "asc" },
                take: limit,
              },
              activeTx
            );

            berth = availableBerths[0] || null; // Pick first available berth
          }

          // Still if no berth found, throw error
          if (!berth) {
            throw "No available berths for passenger: " + passenger.name;
          }

          // Allocate berth to passenger
          allocatedBerths.push({
            passenger_id: passenger.id,
            passenger_name: passenger.name,
            passenger_age: passenger.age,
            passenger_gender: passenger.gender,
            berth_id: berth.id,
            coach_no: berth.coach_no,
            berth_no: berth.berth_no,
            berth_type: berth.berth_type,
            berth_status: passenger.status,
          });

          // Update berth status to CONFIRMED
          await berthRepositories.updateOne(
            { id: berth.id },
            { berth_status: BERTH_STATUS.CONFIRMED },
            activeTx
          );

          // Add berth & passenger mapping
          await passengerBerthService.addPassengerBerth(
            { berthId: berth.id, passengerId: passenger.id },
            activeTx
          );
        }
      }

      return {
        childCount,
        adultCount,
        allocatedBerths,
      };
    } catch (error) {
      console.log("Erro: berthService - allocateBerths", error);
      throw error;
    }
  });
};

const updateBerths = async (
  condition = {},
  dataToUpdate = {},
  masterTx = null
) => {
  return await transactionUtil.runInTransaction(async (tx) => {
    let activeTx = masterTx ? masterTx : tx;

    try {
      return await berthRepositories.updateMany(
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
  addBerths,
  getBerths,
  allocateBerths,
  updateBerths,
};
