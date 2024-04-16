const { TokenExpiredError } = require("jsonwebtoken");
const library = require("../../services");
const adminSchema = require("../model/adminModel");
const userSchema = require('../model/userModel');

module.exports = {
  adminMiddleWare: async (request, response, next) => {
    const authorisation = request.header("G.K-Auth_Token");
    if (!authorisation) {
      response.status(401).send("Unauthorized");
    } else {
      try {
        const verifyToken = await library.verifyToken(authorisation);
        console.log(verifyToken);
        const verifyAdmin = await adminSchema.findOne({
          designation: verifyToken.designation,
        });
        if (!verifyAdmin) {
          response.status(404).send({
            message: "Unauthorized",
            status: false,
          });
        } else {
          console.log(`${verifyAdmin.Admin_id} AUTHORISED AS AN ADMIN`);
          next();
        }
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          console.log("Token expired");
          response.status(401).json({
            message: "Admin Token expired",
            status: false,
          });
        } else if (error.name === "JsonWebTokenError") {
          console.log(error.message);
          response.status(401).json({
            message: "Invalid token",
            status: false,
          });
        } else {
          console.log(error);
          response.status(500).json({
            code: 401,
            message: "Unauthorized",
            description: "The token provided has expired.",
            suggestedAction: "Please obtain a new token and try again.",
          });
        }
      }
    }
  },
  staffMiddleWare: async (request, response, next) => {
    const authorisation = request.header("G.K-Auth_Token");
    if (!authorisation) {
      response.status(401).send("Unauthorized");
    } else {
      try {
        const verifyToken = await library.verifyToken(authorisation);
        const verifyAdmin = await userSchema.findOne({
          designation: verifyToken.designation,
        });
        if (!verifyAdmin) {
          response.status(404).send({
            message: "Unauthorized",
            status: false,
          });
        } else {
          console.log(`${verifyAdmin.Staff_id} AUTHORISED AS AN STAFF`);
          next();
        }
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          console.log("Token expired");
          response.status(401).json({
            message: "Admin Token expired",
            status: false,
          });
        } else if (error.name === "JsonWebTokenError") {
          console.log(error.message);
          response.status(401).json({
            message: "Invalid token",
            status: false,
          });
        } else {
          console.log(error);
          response.status(500).json({
            code: 401,
            message: "Unauthorized",
            description: "The token provided has expired.",
            suggestedAction: "Please obtain a new token and try again.",
          });
        }
      }
    }
  },
};
