const admin = require("../router/adminRouter");

module.exports = function (app) {
  app.use("/Admin", admin);
};
