const generatePNR = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Generates a 10-digit PNR
};

module.exports = {
  generatePNR,
};
