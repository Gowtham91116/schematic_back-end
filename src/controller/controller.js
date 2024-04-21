const services = require("../../services");
const bcrypt = require("bcrypt");
const superAdminSchema = require("../model/superAdminModel");
const roleSchema = require("../model/roleModel");
const mongoose = require("mongoose");
// const {OAuth2Client} = require('google-auth-library');

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
        ]
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

  getSuperAdminWithRole: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");
      const verifyToken = await services.verifyToken(authorisation);
      const { _id } = verifyToken;
  
      console.log("User ID:", _id); // Check the value of _id
  
      const superAdminWithRole = await superAdminSchema.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId.createFromHexString(_id) }
          // Match super admin by _id
        },
        {
          $lookup: {
            from: "roles", // Name of the role collection
            localField: "_id",
            foreignField: "_id",
            as: "role", // Output array field
          },
        },
        {
          $unwind: "$role", // Convert role array to object
        },
        {
          $project: {
            _id: 1,
            Super_Admin_id: 1,
            username: 1,
            email: 1,
            contact: 1,
            designation: 1,
            profilePic: 1,
            googleId: 1,
            isActive: 1,
            password: 1,
            role: {
              roleName: 1,
              description: 1,
              workReport: 1,
              expances: 1,
            },
          },
        },
      ]);
  
      if (!superAdminWithRole || superAdminWithRole.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Super admin not found",
          data: null,
        });
      }
  
      res.status(200).json({
        success: true,
        message: "Super admin with role fetched successfully",
        data: superAdminWithRole[0], // Return the first element of the array
      });
    } catch (error) {
      console.error("Error in getting super admin with role:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  
  getSuperAdminById: async (req, res) => {
    try {
      const authorisation = req.header("G.K-Auth_Token");

      const verifyToken = await services.verifyToken(authorisation);

      const { _id } = verifyToken;

      const getSuperAdmin = await superAdminSchema.findOne({_id:_id,isActive:true});

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

      // Assuming the updated data is sent in the request body

      const { username, email, contact, password } = req.body;

      const hashPassword = await services.createPassword(password);

      const updatedData = {
        username,
        email,
        contact,
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
      const { _id } = req.params;
      const clientData = req.body;
      // Create a new role document using the Role schema
      const newRole = new roleSchema({ ...clientData, _id });

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
};
