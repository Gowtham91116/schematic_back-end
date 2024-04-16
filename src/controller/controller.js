const services = require("../../services");
const bcrypt = require("bcrypt");
const adminSchema = require("../model/adminModel");
const userSchema = require("../model/userModel");
const staffExpanceSchema = require("../model/expancesModel");

module.exports = {
  createAdmin: async (req, res) => {
    try {
      const adminClientData = req.body;
      console.log(adminClientData);
      const { username, email, contact, password } = adminClientData;

      const hashPassword = await services.createPassword(password);

      const count = await adminSchema.countDocuments();

      const admin = new adminSchema({
        Admin_id: `Admin_Id_${count + 1}`,
        username: username,
        email,
        contact,
        designation: "Admin",
        password: hashPassword,
      });

      const savedAdmin = await admin.save();

      res.status(201).send({
        code: 201,
        message: "Created",
        description:
          "The request has been fulfilled, and a new resource is created.",
        suggestedAction:
          "Review the response body for details of the newly created resource.",
        status: true,
        admin: savedAdmin,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },
  adminLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      const admin = await adminSchema.findOne({
        $or: [{ email: username }, { username }],
      });
      if (!admin) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description: "The server cannot find the requested resource.",
          suggestedAction:
            "Verify the URL for any mistakes or contact the server administrator.",
          status: false,
          message: "Admin not found",
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, admin.password);
      console.log(isPasswordMatch);
      if (!isPasswordMatch) {
        return res.status(401).send({
          code: 401,
          message: "Unauthorized",
          description:
            "The request has not been applied because it lacks valid authentication credentials.",
          suggestedAction:
            "Please provide valid credentials or authenticate the request.",
          status: false,
          message: "Invalid credentials",
        });
      }

      const authToken = await services.createToken({
        Admin_id: admin.Admin_id,
        name: admin.name,
        email: admin.email,
        designation: admin.designation,
      });

      res.status(200).send({
        code: 200,
        message: "OK",
        description: "The request has succeeded.",
        suggestedAction: "No specific action required. Request was successful.",
        status: true,
        message: "Login Successful",
        data: admin,
        token: authToken,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
        status: false,
        message: "Internal server error",
      });
    }
  },

  createStaff: async (req, res) => {
    try {
      const userClientData = req.body;

      const { username, email, contact, password } = userClientData;

      const hashPassword = await services.createPassword(password);

      const count = await userSchema.countDocuments();

      const user = new userSchema({
        Staff_id: `Staff_Id_${count + 1}`,
        username: username,
        email,
        contact,
        designation: "Staff",
        password: hashPassword,
      });

      const savedUser = await user.save();

      res.status(201).send({
        code: 201,
        message: "Created",
        description:
          "The request has been fulfilled, and a new resource is created.",
        suggestedAction:
          "Review the response body for details of the newly created resource.",
        status: true,
        admin: savedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },

  staffLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const staff = await userSchema.findOne({
        $or: [{ email: username }, { username: username }],
      });

      if (!staff) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description: "The server cannot find the requested resource.",
          suggestedAction:
            "Verify the URL for any mistakes or contact the server administrator.",
          status: false,
          message: "Admin not found",
        });
      }

      const isPasswordMatch = await bcrypt.compare(password, staff.password);
      if (!isPasswordMatch) {
        return res.status(401).send({
          code: 401,
          message: "Unauthorized",
          description:
            "The request has not been applied because it lacks valid authentication credentials.",
          suggestedAction:
            "Please provide valid credentials or authenticate the request.",
          status: false,
          message: "Invalid credentials",
        });
      }

      const authToken = await services.createToken({
        Staff_id: staff.Staff_id,
        username: staff.username,
        email: staff.email,
        designation: staff.designation,
      });

      res.status(200).send({
        code: 200,
        message: "OK",
        description: "The request has succeeded.",
        suggestedAction: "No specific action required. Request was successful.",
        status: true,
        message: "Login Successful",
        data: staff,
        token: authToken,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
        status: false,
        message: "Internal server error",
      });
    }
  },
  staffExpances: async (req, res) => {
    try {
      const { Staff_id } = req.params;
      const { expanceType, expanceCost, notes } = req.body;

      // Create a new instance of staffExpanceSchema
      const expense = new staffExpanceSchema({
        Expance_id: Staff_id,
        expanceType,
        expanceCost,
        notes,
      });

      // Save the expense to the database
      const createExpense = await expense.save();

      // Respond with a success message and the created expense data
      res.status(201).send({
        code: 201,
        message: "Created",
        description:
          "The request has been fulfilled, and a new resource is created.",
        suggestedAction:
          "Review the response body for details of the newly created resource.",
        data: createExpense,
      });
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error creating expense:", error);

      // Respond with an internal server error message
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },

  getStaffExpances: async (req, res) => {
    try {
      const { Staff_id } = req.params;
      
      // Assuming you have a Mongoose model named StaffExpenses
      const staffExpenses = await StaffExpenses.find({ Expance_id: Staff_id });

      if (staffExpenses.length === 0) {
        return res.status(404).json({
          code: 404,
          message: "Not Found",
          description: "No staff expenses found for the provided Staff_id",
          suggestedAction:
            "Verify the Staff_id and try again or contact the server administrator.",
        });
      }

      res.status(200).json({
        code: 200,
        message: "OK",
        description: "Staff expenses retrieved successfully",
        data: staffExpenses,
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
        error: error.message,
      });
    }
  },
};
