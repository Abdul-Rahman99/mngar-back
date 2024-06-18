const express = require("express");
const router = express.Router();
const sessionMiddleware = require("../middleware/sessionMiddleware");
//const { isAllowed } = require('../utils/myAauth');

const {
  getFeedLevelData,
  getFeedLocations,
  getSchedulesSummary,
  getAllNotifications,
  getFeedDateTimes,
  updateTankCapacity,
  refillTank,
} = require("../controllers/dashboardcontroller");
const {
  getSensorData,
  getServerData,
  getVoltCurrentData,
  getAlarmNotificationsData,
  getAllNotificationsList,
} = require("../controllers/mqttcontroller.js");
const {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
  getUsers,
  addUser,
  deleteUser,
  updatePassword,
  updateUserStatus,
  updateUserTypeStatus,
  deleteUserType,
  addUserType,
  getUserTypes,
  updateUserProfile,
  uploadProfilePicture,
  getProfilePicture,
  getUserDevices,
  assignDevice,
} = require("../controllers/usercontroller.js");
const {
  addRole,
  getRoles,
  updateRole,
  deleteRole,
} = require("../controllers/rolecontroller.js");

const {
  getUserRole,
  assignRole,
} = require("../controllers/userrolecontroller.js");
const {
  addPermission,
  getPermissions,
  updatePermission,
  deletePermission,
  checkPermission,
} = require("../controllers/permissioncontroller.js");
const {
  assignPerm,
  getRolePerms,
} = require("../controllers/rolepermassigncontroller.js");
const {
  TestAPI,
  addSchedule,
  updateScheduleStatus,
  getSchedules,
  getFeedConsumptionData,
  getSunriseSunsetRange,
  getFeedsTimings,
  deleteSchedule,
  UpdateScheduleStopStatus,
  getFeederStopStatus,
  ExecuteFeedNow,
} = require("../controllers/foodcontroller.js");
const {
  getDevices,
  addDevice,
  getDeviceDetails,
  getAllBirdsData,
  getBirdsData,
  getBirdsDataForGraph,
  updateFeederStatus,
  deleteFeeder,
  getBirdsDataForAdmin,
  getExportedData,
} = require("../controllers/birdfeedcontroller.js");

const { getCsv } = require("../controllers/csvexporter");
//dashboard
router.get("/api/getFeedLevelData", sessionMiddleware, getFeedLevelData);
router.get("/api/getSchedulesSummary", getSchedulesSummary);
router.get("/api/getAllNotifications", getAllNotifications);
router.get(
  "/api/getAllNotificationsList",
  sessionMiddleware,
  getAllNotificationsList
);

// BirdsFeed
//router.get('/api/getDevices',sessionMiddleware ,getDevices)
router.get(
  "/api/getDevices",
  (req, res, next) => {
    // sessionMiddleware(req, res, next, 'get_devices');
    sessionMiddleware(req, res, next, "bird-feeding-devices");
  },
  getDevices
);
router.post("/api/addDevice", sessionMiddleware, addDevice);
router.post("/api/updateFeederStatus", sessionMiddleware, updateFeederStatus);
router.delete("/api/deleteFeeder/:id", sessionMiddleware, deleteFeeder);
router.get("/api/getAllBirdsData", sessionMiddleware, getAllBirdsData);
router.get("/api/getBirdsData/:feederId", sessionMiddleware, getBirdsData);
router.get(
  "/api/getDeviceDetails/:feederId",
  sessionMiddleware,
  getDeviceDetails
);
router.get(
  "/api/getFeedDateTimes/:feederId",
  sessionMiddleware,
  getFeedDateTimes
);

router.get(
  "/api/getBirdsDataForGraph/:feederId/:datefrom?/:sfilter?",
  sessionMiddleware,
  getBirdsDataForGraph
);
//router.get('/api/getBirdsDataForAdmin/:page?/:pageSize?',sessionMiddleware, getBirdsDataForAdmin)
router.get(
  "/api/getBirdsDataForAdmin/:page?/:pageSize?",
  (req, res, next) => {
    // sessionMiddleware(req, res, next, 'bird_data');
    sessionMiddleware(req, res, next, "manage-birds");
  },
  getBirdsDataForAdmin
);

// MQTT
router.get("/api/getSensorData/:feederId", getSensorData);
router.post("/api/publishMessage", getServerData);
router.get("/api/getVoltCurrentData/:feederId", getVoltCurrentData);
router.get("/api/getAlarmNotificationsData", getAlarmNotificationsData);

// User
router.post("/auth/signup", register);
router.post("/auth/signin", login);
router.post("/auth/signout", logout);
router.post("/auth/forgotPassword", forgotPassword);
router.post("/auth/resetPassword", resetPassword);

router.post("/api/updatePassword", updatePassword);

router.post("/api/updateUserStatus", updateUserStatus);

//administration
//router.get("/api/getUsers", getUsers);
router.get(
  "/api/getUsers",
  (req, res, next) => {
    sessionMiddleware(req, res, next, "manage-users");
  },
  getUsers
);
router.post("/api/addUser", addUser);
router.post("/api/addUserType", addUserType);
router.post("/api/updateUserTypeStatus", updateUserTypeStatus);
router.get("/api/getUserTypes", getUserTypes);
router.delete("/api/deleteUser/:userId", deleteUser);
router.get("/api/getUserDevices/:userId", getUserDevices);
router.delete("/api/deleteUserType/:usertype_id", deleteUserType);

router.post("/api/assignDevice", assignDevice);
router.post("/api/updateUserProfile", updateUserProfile);
router.post("/api/uploadProfilePicture", uploadProfilePicture);
router.get("/api/getProfilePicture/:userId", getProfilePicture);

// Role management APIs
router.post("/api/addRole", sessionMiddleware, addRole);
router.post("/api/updateRole", sessionMiddleware, updateRole);
router.get(
  "/api/getRoles",
  (req, res, next) => {
    sessionMiddleware(req, res, next, "manage-roles");
  },
  getRoles
);
router.delete("/api/deleteRole/:role_id", sessionMiddleware, deleteRole);

// Permission management APIs
router.post("/api/addPermission", sessionMiddleware, addPermission);
router.post("/api/updatePermission", sessionMiddleware, updatePermission);
router.get(
  "/api/getPermissions",
  (req, res, next) => {
    sessionMiddleware(req, res, next, "manage-permissions");
  },
  getPermissions
);
router.delete(
  "/api/deletePermission/:permission_id",
  sessionMiddleware,
  deletePermission
);

// User Role management APIs
//router.get("/api/getUserRole",sessionMiddleware, getUserRole);
router.get(
  "/api/getUserRole",
  (req, res, next) => {
    // sessionMiddleware(req, res, next, 'manage_user_role');
    sessionMiddleware(req, res, next, "user-roles");
  },
  getUserRole
);
router.post("/api/assignRole", sessionMiddleware, assignRole);
router.get("/api/checkPermission", sessionMiddleware, checkPermission);
//  Role Permission management APIs
router.get("/api/getRolePerms/:roleId", sessionMiddleware, getRolePerms);
router.post("/api/assignPerm", sessionMiddleware, assignPerm);

// Food Controller
router.post("/api/addSchedule/:feederId", addSchedule);
router.post("/api/deleteSchedule/:userId/:feederId", deleteSchedule);
router.post(
  "/api/updateScheduleStatus/:userId/:feederId",
  updateScheduleStatus
);
router.post(
  "/api/UpdateScheduleStopStatus/:userId/:feederId",
  UpdateScheduleStopStatus
);
router.get("/api/getFeederStopStatus/:feederId", getFeederStopStatus);
router.get("/api/getSchedules/:feederId", getSchedules);
router.get(
  "/api/getFeedConsumptionData/:feederId/:sfilter?/:datefrom?/:dateto?",
  getFeedConsumptionData
);

router.get("/api/sunriseSunsetRange", getSunriseSunsetRange);
router.get("/api/getFeedsTimings/:feederId", getFeedsTimings);
router.post("/api/ExecuteFeedNow/:userId/:feederId", ExecuteFeedNow);
router.get("/api/TestAPI", TestAPI);

router.get("/api/getcsv/:reqData", getCsv);
router.get("/api/getExportedData/:feederId/:date/:sfilter?", getExportedData);

router.post("/api/updateTankCapacity", sessionMiddleware, updateTankCapacity);
router.post("/api/refillTank", sessionMiddleware, refillTank);

module.exports = router;
