const models = require("../models");
const { DataTypes, Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const multer = require("multer");

const auth = require("../middleware/auth");
const { isAdmin, isAllowed } = require("../utils/myAauth");
const { uploadProfilePictureMiddleware } = require("../middleware/multer");

// UserTypes
const login = async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    let user = await models.Users.findOne({
      where: { email: email },
    });
    // console.log(user)
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.status) {
        // Create token
        const token = jwt.sign(
          { user_id: user.id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        // const userType = await models.UserTypes.findOne({
        //     where: { id: user.usertype_id },
        // });

        user._id = user.id;

        user.token = token;
        // user.passwordtoken = "60896737213987cc2f81dc08ef77fcc18c6b8d8dadc13e81b31b79b55b70d9b5";
        // user.passwordtokenexp = "2023-10-02T07:40:46.114Z";

        const response = {
          status: "success",
          token: token,
          data: user,
          //"userType": userType
        };

        let date = new Date().toISOString().substring(0, 19);
        await models.LoginLogs.create({
          user_id: user.id,
          user_loggedin_date: date,
          token: token,
          status: true,
        });

        req.session.user = user;

        // user
        res.status(200).json(response);
      } else {
        const response = {
          status: "errors",
          data: "You status is inactive Contact with admin",
        };

        res.status(200).send(response);
      }
    } else {
      const response = {
        status: "errors",
        data: "incorrect id or password",
      };

      let date = new Date().toISOString().substring(0, 19);
      await models.LoginLogs.create({
        user_id: 0,
        user_loggedin_date: date,
        token: "invalid attempt :" + email + " pass: " + password,
        status: false,
      });

      res.status(200).send(response);
    }
  } catch (err) {
    const response = {
      status: "errors",
      data: "something went wrong",
    };
    res.status(200).send(response);
    console.log(err);
  }
  // res.status(200).json({ success: true });
};

const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: "error",
        message: "Failed to logout",
      });
    }

    // Successful logout
    return res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  });
};

const register = async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password, username } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(200).send("All inputs are required");
    }

    const oldUser = await models.Users.findOne({ where: { email: email } });

    if (oldUser) {
      return res
        .status(200)
        .json({ message: "Email Already Exist. Please Login" });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await models.Users.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      username,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    const response = {
      status: "success",
      token: token,
      data: user,
    };

    // return new user
    res.status(201).json(response);
  } catch (err) {
    console.log(err);
  }

  //res.status(200).json({ success: true });
};
const getUsers = async (req, res) => {
  try {
    // process.exit;
    // const users = await UserModel.findAll({ include: UserTypesModel });
    // const users = await UserModel.findAll();
    const users = await models.Users.findAll({
      include: [
        //  { model: models.UserTypes },
        {
          model: models.UserDevices,
          include: [{ model: models.FeedingDevices, attributes: ["title"] }],
        },
      ],
    });

    // console.log(users);
    // process.exit;
    const user_id = req.session.user.id;

    const isAdminUser = await isAdmin(req.session.user.id);
    const control1 = await isAllowed("view_dashboard", user_id);
    const response = {
      status: true,
      data: users,
      is_admin: isAdminUser,
      control: control1,
    };

    if (users) {
      res.status(200).json(response);
    } else {
      res.status(200).json({ status: false, data: "No users found" });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: false, data: "No users found" });
  }
};
const forgotPassword = async (req, res) => {
  const userEmail = req.body.email;

  // Check if the email exists in your database
  let user = await models.Users.findOne({ where: { email: userEmail } });

  if (user) {
    // Generate a unique token for the password reset link
    const token = Math.floor(100000 + Math.random() * 900000);
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Set expiration to 1 hour from now

    await models.ResetTokens.create({
      token,
      user_id: user.id,
      expiry_date: expiryDate,
    });

    // Create the email template
    const emailTemplate = `
      <p>Hello,</p>
      <p>You have requested to reset your password. Here is your token:</p>
      <p>${token}</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    // Create a Nodemailer transporter using your email service credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "developer@dccme.ai", // replace this with developer@dccme.ai
        pass: "yfen ping pjfh emkp", // replace this with google app password
      },
    });

    const mailOptions = {
      from: "developer@dccme.ai",
      to: userEmail,
      subject: "Password Reset Request for Mngar.ae",
      html: emailTemplate,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);

      res.status(200).json({
        status: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: `Failed to send password reset email: ${error.message}`,
      });
    }
  } else {
    res.status(500).json({
      status: false,
      message: `Failed to send password reset email`,
    });
  }
};

const resetPassword = async (req, res) => {
  const code = req.body.code;
  const password = req.body.new_password;
  if (code && password) {
    let response = await models.ResetTokens.findOne({ where: { token: code } });

    if (response?.dataValues) {
      let user_id = response.dataValues.user_id;

      let encryptedPassword = await bcrypt.hash(password, 10);

      // update user in our database
      await models.Users.update(
        {
          password: encryptedPassword,
        },
        {
          where: {
            id: user_id,
          },
        }
      );

      //distroy record to secure for future scame
      await models.ResetTokens.destroy({
        where: {
          user_id: user_id,
        },
      });

      res.status(200).json({
        status: true,
        message: "Password reset success",
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Please Provide a valid Code or Code is Expired",
      });
    }
  } else {
    res
      .status(500)
      .json({ status: false, message: "Code and Password are required" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      isNew,
      id,
      fname,
      lname,
      email,
      username,
      password,
      userType,
      feederId,
      selectedMulti,
    } = req.body;

    // Validate user input
    if (!(email && fname && username && lname)) {
      return res.status(400).send("All inputs are required");
    }

    let updateData = {
      first_name: fname,
      last_name: lname,
      email: email.toLowerCase(), // Sanitize: convert email to lowercase
      username: username,
      usertype_id: userType,
      feeder_id: feederId,
    };

    // Update password only if it's available
    if (password) {
      const encryptedPassword = await bcrypt.hash(password, 10);
      updateData.password = encryptedPassword;
    }

    // Update user in the database
    const user = await models.Users.update(updateData, {
      where: {
        id: req.session.user.id,
      },
    });

    const response = {
      status: true,
      message: "User profile updated successfully",
      data: user,
    };
    res.status(200).json(response);
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).send("An error occurred while updating the user profile.");
  }
};
const uploadProfilePicture = async (req, res) => {
  try {
    uploadProfilePictureMiddleware(req, res, async (err) => {
      // process.exit(0)
      const userId = req.body.userId;
      // const originalFileName = userId// req.file.originalname;
      const originalFileName = req.file.originalname;

      if (err instanceof multer.MulterError) {
        return res.status(400).send("Multer error: " + err.message);
      } else if (err) {
        return res.status(500).send("Internal server error: " + err.message);
      }
      await models.UploadedFiles.destroy({
        where: {
          link_id: userId,
        },
      });
      await models.UploadedFiles.create({
        term: "profile_picture",
        link_id: userId,
        file_path: originalFileName,
      });

      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      res.send("File uploaded successfully!");
    });
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error);
    res.status(500).send("Internal server error");
  }
};
const getProfilePicture = async (req, res) => {
  try {
    const uploadedFile = await models.UploadedFiles.findOne({
      where: {
        link_id: req.params.userId,
      },
    });
    console.log(uploadedFile);

    const response = {
      status: true,
      data: uploadedFile,
    };

    if (uploadedFile) {
      res.status(200).json(response);
    } else {
      res.status(200).json({ status: false, data: "No files found" });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: false, data: "No files found" });
  }
};

const addUser = async (req, res) => {
  try {
    const {
      isNew,
      id,
      fname,
      lname,
      email,
      username,
      password,
      userType,
      feederId,
      selectedMulti,
    } = req.body;
    // if (selectedMulti) {
    //     console.log(selectedMulti)
    //     process.exit(0)
    // }
    // Validate user input
    let user;
    if (isNew) {
      if (!(email && password && username && fname && lname)) {
        res.status(200).send("All inputs are required");
      }

      //Encrypt user password
      let encryptedPassword = await bcrypt.hash(password, 10);

      user = await models.Users.create(
        {
          first_name: fname,
          last_name: lname,
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          password: encryptedPassword,
          username: username,
          usertype_id: userType,
        },
        {
          where: {
            id: isNew,
          },
        }
      );

      // Insert into userDevices model
      if (selectedMulti && selectedMulti.length > 0) {
        const userDevicesData = selectedMulti.map((device) => ({
          user_id: user.id,
          feeder_id: device.value,
        }));
        console.log(userDevicesData);
        await models.UserDevices.bulkCreate(userDevicesData);
      }
    } else {
      if (!(email && fname && lname)) {
        res.status(200).send("All inputs are required");
      }

      // update user in our database
      user = await models.Users.update(
        {
          first_name: fname,
          last_name: lname,
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          // password: encryptedPassword,
          username: username,
          usertype_id: userType,
          feeder_id: feederId,
        },
        {
          where: {
            id: id,
          },
        }
      );

      // Distroy all the records belong to this user

      await models.UserDevices.destroy({
        where: {
          user_id: id,
        },
      });
      // Insert into userDevices model
      if (selectedMulti && selectedMulti.length > 0) {
        const userDevicesData = selectedMulti.map((device) => ({
          user_id: id,
          feeder_id: device.value,
        }));
        console.log(userDevicesData);
        await models.UserDevices.bulkCreate(userDevicesData);
      }
    }
    const response = {
      status: true,
      data: user,
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};
const updateUserStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    let user;

    user = await models.Users.update(
      {
        status: status,
      },
      {
        where: {
          id: id,
        },
      }
    );

    const response = {
      status: true,
      data: user,
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};
const updatePassword = async (req, res) => {
  // TODO : add middleware to ristrict from changing other user's details
  try {
    const { id, password } = req.body;

    let user;

    let encryptedPassword = await bcrypt.hash(password, 10);

    // update user in our database
    user = await models.Users.update(
      {
        password: encryptedPassword,
      },
      {
        where: {
          id: id,
        },
      }
    );

    const response = {
      status: true,
      data: user,
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};
const deleteUser = async (req, res) => {
  try {
    await models.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await models.Users.destroy({
      where: {
        id: req.params.userId,
      },
    });

    await models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    const response = {
      status: true,
      data: "User deleted successfully",
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

/// user types
const addUserType = async (req, res) => {
  try {
    let UserType;
    const { id, isNew, title } = req.body;

    if (!title) {
      res.status(200).send("Title required");
    }

    if (isNew) {
      const oldUserType = await models.UserTypes.findOne({
        where: { title: title },
      });

      if (oldUserType) {
        return res.status(409).send("User Type Already Exist");
      }
      UserType = await models.UserTypes.create({
        title,
      });
    } else {
      UserType = await models.UserTypes.update(
        {
          title,
        },
        { where: { id: id } }
      );
    }
    const response = {
      status: true,
      data: UserType,
    };
    res.status(200).send(response);
  } catch (err) {}
};
const getUserTypes = async (req, res) => {
  try {
    const usertypes = await models.UserTypes.findAll();

    const response = {
      status: true,
      data: usertypes,
    };

    if (usertypes) {
      res.status(200).json(response);
    } else {
      res.status(200).json({ status: false, data: "No usertypes found" });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: false, data: "No usertypes found" });
  }
};
const updateUserTypeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    let userType;

    userType = await models.UserTypes.update(
      {
        status: status,
      },
      {
        where: {
          id: id,
        },
      }
    );

    const response = {
      status: true,
      data: userType,
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

const deleteUserType = async (req, res) => {
  try {
    await models.UserTypes.destroy({
      where: {
        id: req.params.usertype_id,
      },
    });

    const response = {
      status: true,
      data: "User Type deleted successfully",
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

const getUserDevices = async (req, res) => {
  try {
    const { userId } = req.params;

    const userDevicesData = await models.UserDevices.findAll({
      where: {
        user_id: userId,
      },
    });

    if (userDevicesData.length > 0) {
      const feederIds = userDevicesData.map((entry) => entry.feeder_id);
      const response = {
        status: true,
        data: feederIds.join(","),
      };
      res.status(200).json(response);
    } else {
      res.status(404).json({
        status: false,
        message: "No user devices found for the specified user ID",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

const assignDevice = async (req, res) => {
  try {
    var messsage;
    const { userId, deviceId, status } = req.body;

    // Validate the incoming data
    if (!userId || status === undefined) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid request payload" });
    }

    // Convert status to a boolean (assuming it's sent as 0 or 1)
    const isChecked = status === 1;

    // Check if the user exists (you may want to perform additional validations)
    const user = await models.Users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // If deviceId is 0, handle assigning/removing all devices
    if (deviceId === 0) {
      if (isChecked) {
        // Remove all existing user devices
        await models.UserDevices.destroy({
          where: {
            user_id: userId,
          },
        });

        // Insert all devices
        const allDevices = await models.FeedingDevices.findAll();
        await Promise.all(
          allDevices.map((device) => {
            return models.UserDevices.create({
              user_id: userId,
              feeder_id: device.id,
            });
          })
        );

        messsage = "All devices are successfully assigned";
      } else {
        // Remove all existing user devices
        await models.UserDevices.destroy({
          where: {
            user_id: userId,
          },
        });

        messsage = "All devices are successfully removed";
      }
    } else {
      // Handle assigning/removing a specific device
      const device = await models.FeedingDevices.findByPk(deviceId);

      if (!device) {
        return res
          .status(404)
          .json({ status: false, message: "Device not found" });
      }

      if (isChecked) {
        await models.UserDevices.create({
          user_id: userId,
          feeder_id: deviceId,
        });
        messsage = "Device is successfully assigned";
      } else {
        await models.UserDevices.destroy({
          where: {
            user_id: userId,
            feeder_id: deviceId,
          },
        });
        messsage = "Device is successfully removed";
      }
    }

    // Respond with success
    const userDevicesData = await models.UserDevices.findAll({
      where: {
        user_id: userId,
      },
    });

    const feederIds = userDevicesData.map((entry) => entry.feeder_id);
    const feederDevices = await models.FeedingDevices.findAll();

    const response = {
      status: true,
      data: feederIds.join(","),
      devices: feederDevices,
      message: messsage,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error assigning/unassigning role", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error: error });
  }
};

module.exports = {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  getUsers,
  addUser,
  updateUserStatus,
  updatePassword,
  deleteUser,
  uploadProfilePicture,
  getProfilePicture,
  addUserType,
  getUserTypes,
  updateUserTypeStatus,
  deleteUserType,
  updateUserProfile,
  getUserDevices,
  assignDevice,
};
