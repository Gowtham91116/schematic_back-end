const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

module.exports = {
  createPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  },
  createToken: async (data) => {
    const token = await jsonwebtoken.sign(data, "uj84ur84yr4y98", {
      expiresIn: "3hours",
    });
    return token;
  },
  verifyToken: async (token) => {
    try {
      const verifiedToken = await jsonwebtoken.verify(token, "uj84ur84yr4y98");
      return verifiedToken;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else {
        throw new Error('Invalid token');
      }
    }
  }
};