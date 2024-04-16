const admin = require("../router/adminRouter");
const staff = require("../router/staffRouter");

module.exports = function (app) {
  app.use("/Admin", admin);
  app.use("/Staff", staff);
};
