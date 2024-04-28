const services = require("../../services");
const bcrypt = require("bcrypt");
const superAdminSchema = require("../model/superAdminModel");
const roleSchema = require("../model/roleModel");
const userSchema = require("../model/usersModel");
const expenseSchema = require("../model/expancesModel");
const mongoose = require("mongoose");
const { verify } = require("jsonwebtoken");
const nodemailer = require('nodemailer');



module.exports = {
  createSuperAdmin: async (req, res) => {
    try {
      const adminClientData = req.body;
      console.log(adminClientData);
      const { username, email, contact, password } = adminClientData;

      // Check if username already exists
      const existingAdmin = await superAdminSchema.findOne({ username });
      if (existingAdmin) {
        return res.status(400).send({
          code: 400,
          message: "Bad Request",
          description: "The username is already taken.",
          suggestedAction: "Please choose a different username.",
          status: false,
        });
      }

      const hashPassword = await services.createPassword(password);

      const count = await superAdminSchema.countDocuments();

      const admin = new superAdminSchema({
        Super_Admin_id: `Super_admin_${count + 1}`,
        username: username,
        email,
        contact,
        designation: "superAdmin",
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
      console.error("Error creating super admin:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },
  superAdminLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      const admin = await superAdminSchema.findOne({
        $and: [
          {
            $or: [{ email: username }, { username }],
          },
          { isActive: true },
        ],
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
        _id: admin._id,
        Super_Admin_id: admin.Super_Admin_id,
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

  getRoles: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");
      const verifyToken = await services.verifyToken(authorisation);
      const { _id } = verifyToken;
      console.log(_id);
      const roles = await roleSchema.find({
        superAdminId: _id,
        isActive: true,
      });
      console.log(roles, "143");
      if (!roles || roles.length === 0) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description: "Roles not found for this super admin",
          suggestedAction:
            "Ensure the super admin ID is correct or create roles for this super admin.",
          data: null,
        });
      }

      res.status(200).send({
        code: 200,
        message: "OK",
        description: "Roles for super admin fetched successfully",
        data: roles,
      });
    } catch (error) {
      console.error("Error in getting super admin with role:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "An unexpected error occurred while processing the request",
        error: error.message,
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },

  getSingleRole: async (req, res) => {
    try {
      // Extract the _id parameter from request params
      const { _id } = req.params;

      // Find the role document by its _id
      const role = await roleSchema.findById(_id);

      // Check if role document exists
      if (!role) {
        // If role is not found, return 404 status code with an error message
        return res.status(404).json({
          code: 404,
          message: "Not Found",
          description: "Role not found",
          suggestedAction: "Verify the role ID and try again.",
        });
      }

      // Return role document with 200 status code and success message
      res.status(200).json({
        code: 200,
        message: "OK",
        description: "Role fetched successfully",
        data: role,
      });
    } catch (error) {
      // Handle errors
      console.error("Error in getting role:", error);
      // Return 500 status code with error message if an error occurs
      res.status(500).json({
        code: 500,
        message: "Internal Server Error",
        description:
          "An unexpected error occurred while processing the request",
        error: error.message,
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },

  editRole: async (req, res) => {
    try {
      // Extract the _id parameter from request params
      const { _id } = req.params;

      // Extract the updated role data from the request body
      const updatedRoleData = req.body;

      // Find the role document by its _id and update it with the new data
      const role = await roleSchema.findByIdAndUpdate(_id, updatedRoleData, {
        new: true,
      });

      // Check if role document exists
      if (!role) {
        // If role is not found, return 404 status code with an error message
        return res.status(404).send({
          status: false,
          message: "Not Found",
          description: "Role not found",
          suggestedAction: "Verify the role ID and try again.",
        });
      }

      // Return the updated role document with 200 status code and success message
      res.status(200).send({
        status: true,
        message: "OK",
        description: "Role updated successfully",
        data: role,
      });
    } catch (error) {
      // Handle errors
      console.error("Error in updating role:", error);
      // Return 500 status code with error message if an error occurs
      res.status(500).send({
        status: false,
        message: "Internal Server Error",
        description:
          "An unexpected error occurred while processing the request",
        error: error.message,
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },

  deleteRole: async (req, res) => {
    try {
      // Extract the _id parameter from request params
      const { _id } = req.params;
      console.log(_id);
      // Find the role document by its _id and update only the isActive key
      const role = await roleSchema.findByIdAndUpdate(
        _id,
        { isActive: false },
        { new: true }
      );

      // Check if role document exists
      if (!role) {
        // If role is not found, return 404 status code with an error message
        return res.status(404).json({
          code: 404,
          message: "Not Found",
          description: "Role not found",
          suggestedAction: "Verify the role ID and try again.",
          data: null,
        });
      }

      // Return the updated role document with 200 status code and success message
      res.status(200).json({
        code: 200,
        message: "OK",
        description: "Role successfully marked as inactive",
        data: role,
      });
    } catch (error) {
      // Handle errors
      console.error("Error in deleting role:", error);
      // Return 500 status code with error message if an error occurs
      res.status(500).json({
        code: 500,
        message: "Internal Server Error",
        description:
          "An unexpected error occurred while processing the request",
        error: error.message,
        suggestedAction: "Contact the server administrator or try again later.",
        data: null,
      });
    }
  },

  getSuperAdminById: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");

      const verifyToken = await services.verifyToken(authorisation);

      const { _id } = verifyToken;

      const getSuperAdmin = await superAdminSchema.findOne({
        _id: _id,
        isActive: true,
      });

      if (!getSuperAdmin) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description:
            "The requested resource could not be found but may be available again in the future.",
          suggestedAction: "Please verify the ID and try again.",
          status: false,
          data: null,
        });
      }

      res.status(200).send({
        code: 200,
        message: "OK",
        description: "The request has succeeded.",
        suggestedAction: "No specific action required. Request was successful.",
        status: true,
        message: "Admin details fetched successfully",
        data: getSuperAdmin,
      });
    } catch (error) {
      console.error("Error in fetching super admin details:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Please try again later.",
        status: false,
        data: null,
      });
    }
  },

  editSuperAdminById: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");

      const verifyToken = await services.verifyToken(authorisation);

      const { _id } = verifyToken;

      const { username, email, contact, profilePic, password } = req.body;

      const hashPassword = await services.createPassword(password);

      const updatedData = {
        username,
        email,
        contact,
        profilePic,
        password: hashPassword,
      };

      // Find the existing super admin by ID and update it with the new data
      const updatedSuperAdmin = await superAdminSchema.findByIdAndUpdate(
        _id,
        updatedData,
        { new: true }
      );

      if (!updatedSuperAdmin) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description:
            "The requested resource could not be found but may be available again in the future.",
          suggestedAction: "Please verify the ID and try again.",
          status: false,
          data: null,
        });
      }

      res.status(200).send({
        code: 200,
        message: "OK",
        description: "The request has succeeded.",
        suggestedAction: "No specific action required. Request was successful.",
        status: true,
        message: "Admin details updated successfully",
        data: updatedSuperAdmin,
      });
    } catch (error) {
      console.error("Error in editing super admin details:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Please try again later.",
        status: false,
        data: null,
      });
    }
  },

  deleteSuperAdminById: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");

      const verifyToken = await services.verifyToken(authorisation);

      const { _id } = verifyToken;

      // Find the existing super admin by ID and update it with the new data
      const updatedSuperAdmin = await superAdminSchema.findByIdAndUpdate(
        _id,
        { isActive: false },
        { new: true }
      );

      if (!updatedSuperAdmin) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description:
            "The requested resource could not be found but may be available again in the future.",
          suggestedAction: "Please verify the ID and try again.",
          status: false,
          data: null,
        });
      }

      res.status(200).send({
        code: 200,
        message: "OK",
        description: "The request has succeeded.",
        suggestedAction: "No specific action required. Request was successful.",
        status: true,
        message: "Admin details updated successfully",
        data: updatedSuperAdmin,
      });
    } catch (error) {
      console.error("Error in editing super admin details:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Please try again later.",
        status: false,
        data: null,
      });
    }
  },

  createRole: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");

      const verifyToken = await services.verifyToken(authorisation);

      const { _id } = verifyToken;

      const clientData = req.body;
      // Create a new role document using the Role schema
      const newRole = new roleSchema({ ...clientData, superAdminId: _id });

      // Save the new role document to the database
      await newRole.save();
      // Send a success response
      res.status(201).json({
        success: true,
        message: "Role created successfully",
        role: newRole,
      });
    } catch (error) {
      // Handle errors
      console.error("Error creating role:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  createUser: async (req, res) => {
    try {
      const adminClientData = req.body;
      const authorisation = req.header("G.K-Auth_Token");
      const verifyToken = await services.verifyToken(authorisation);
      const { _id } = verifyToken;
      const { username, email, role } = adminClientData;
  
      // Check if username already exists
      const existingAdmin = await userSchema.findOne({ username });
      if (existingAdmin) {
        return res.status(400).send({
          code: 400,
          message: "Bad Request",
          description: "The username is already taken.",
          suggestedAction: "Please choose a different username.",
          status: false,
        });
      }
  
      const newUser = new userSchema({
        userId: _id,
        username: username,
        email,
        role,
      });
  
      const savedUser = await newUser.save();
  
// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_APP_ID,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

      // Send email for password verification
      const mailOptions = {
        from: 'developer.gowtham07@gmail.com',
        to: email,
        subject: "Password verification",
        text: `${process.env.Base_URL}`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).send({
            code: 500,
            message: "Internal Server Error",
            description: "Failed to send email for password verification.",
            suggestedAction: "Please try again later.",
            status: false,
          });
        }
        
        res.status(201).send({
          code: 201,
          message: "Created",
          description: "The request has been fulfilled, and a new resource is created.",
          suggestedAction: "Review the response body for details of the newly created resource.",
          status: true,
          user: savedUser,
        });
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
        status: false,
      });
    }
  },

  getUsers: async (req, res) => {
    try {
      const authorization = req.header("G.K-Auth_Token");
      const verifyToken = await services.verifyToken(authorization);
      const { _id } = verifyToken;
      const userRoles = await userSchema.find({ userId: _id });
      console.log(userRoles, "143");

      if (!userRoles || userRoles.length === 0) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description: "Roles not found for this super admin",
          suggestedAction:
            "Ensure the super admin ID is correct or create roles for this super admin.",
          data: null,
        });
      }

      res.status(200).send({
        code: 200,
        message: "OK",
        description: "Roles for super admin fetched successfully",
        data: userRoles,
      });
    } catch (error) {
      console.error("Error in getting super admin with role:", error);
      res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description:
          "An unexpected error occurred while processing the request",
        error: error.message,
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },

  createExpanseSchema: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");

      const verifyToken = await services.verifyToken(authorisation);

      const { _id } = verifyToken;

      const {
        ApprovedBy,
        approvedRole,
        description,
        amount,
        currency,
        paymentMethod,
        approvalDate,
        staffName,
        approvalStatus,
        latitude,
        longitude,
        category,
        notes,
        attachments,
        isActive,
      } = req.body;

      const count = await expenseSchema.countDocuments();
      // Create a new expense document
      const newExpense = new expenseSchema({
        ApprovedBy,
        approvedRole,
        createdDate: Date(),
        description,
        amount,
        staffName,
        currency,
        paymentMethod,
        receiptNumber: `receipt_no_${count + 1}`,
        approvalDate,
        approvalStatus,
        latitude,
        longitude,
        category,
        notes,
        attachments,
        isActive,
        createdBy: _id,
      });

      // Save the expense document to the database
      await newExpense.save();

      res.status(201).json({
        code: 201,
        message: "Created",
        description:
          "The request has been fulfilled, and a new resource is created.",
        suggestedAction:
          "Review the response body for details of the newly created resource.",
        expense: newExpense,
      });
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({
        code: 500,
        message: "Internal Server Error",
        description:
          "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later.",
      });
    }
  },
  getExpensesData: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");
      const verifyToken = await services.verifyToken(authorisation);
      const { _id } = verifyToken;
      const { isApproved } = req.params;
      let expensesData;
      if (isApproved === "approved") {
        expensesData = await expenseSchema.find({
          createdBy: _id,
          approvalStatus: "Approved",
          isActive: true,
        });
      } else if(isApproved === "pending") {
        expensesData = await expenseSchema.find({
          createdBy: _id,
           approvalStatus: "pending",
          isActive: true,
        });
      }else{
        expensesData = await expenseSchema.find({
          createdBy: _id,
           approvalStatus: "rejected",
          isActive: true,
        });
      }
      res
        .status(200)
        .json({
          success: true,
          data: expensesData,
          code: 200,
          message: "OK",
          description: "The request has succeeded.",
          suggestedAction:
            "No specific action required. Request was successful.",
        });
    } catch (error) {
      console.error("Error fetching expenses data:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          code: 500,
          description:
            "The server encountered an unexpected condition that prevented it from fulfilling the request.",
          suggestedAction:
            "Contact the server administrator or try again later.",
        });
    }
  },
  getExpancesById: async (req, res) => {
    try {
      const { _id } = req.params;
      const get_expense_by_id = await expenseSchema.findById(_id);
      if (!get_expense_by_id) {
        return res.status(404).send({
          code: 404,
          message: "Not Found",
          description: "The requested resource was not found.",
          suggestedAction: "Verify the provided resource ID and try again."
        });
      }
      return res.status(200).send({
        code: 200,
        message: "OK",
        description: "Request successful",
        data: get_expense_by_id
      });
    } catch (error) {
      return res.status(500).send({
        code: 500,
        message: "Internal Server Error",
        description: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        suggestedAction: "Contact the server administrator or try again later."
      });
    }
  }
  

};
