const prisma = require("../database/config");

const addMany = async (payload = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.berth.createMany({ data: payload });
};

const getMany = async (payload = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.berth.findMany(payload);
};

const updateOne = async (condition = {}, dataToUpdate = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.berth.update({
    where: condition,
    data: dataToUpdate,
  });
};

const updateMany = async (condition = {}, dataToUpdate = {}, transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.berth.updateMany({
    where: condition,
    data: dataToUpdate,
  });
};

// Get available berth with passenger count < 2
const getAvailableBerth = async (transaction) => {
  const client = transaction ? transaction : prisma;
  return await client.$queryRaw`
    WITH passenger_counts AS (
      SELECT 
        berth_id, 
        COUNT(id) AS passenger_count
      FROM 
        passenger_berths
      GROUP BY 
        berth_id
    )
    SELECT 
      b.*, 
      COALESCE(pc.passenger_count, 0) AS passenger_count
    FROM 
      berths b
    LEFT JOIN 
      passenger_counts pc ON b.id = pc.berth_id
    WHERE 
      b.berth_status IN ('AVAILABLE', 'RAC')
      AND b.berth_type = 'SL'
      AND COALESCE(pc.passenger_count, 0) < 2
    ORDER BY 
      b.berth_no ASC
    LIMIT 1;
  `;
};

module.exports = {
  addMany,
  getMany,
  updateOne,
  getAvailableBerth,
  updateMany,
};
