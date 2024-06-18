const { collectSchedules } = require("../Helper");
const models = require("../models");
const { Op, QueryTypes } = require("sequelize");

const { FeedingDevices, FoodSchedules, FeedingDone } = require("../models");
const { now } = require("moment");
const getBirdFeedingDevices = (req, res) => {};

// const getFeedPercentage = (ping_dist) => {
//   // if (ping_dist >= 64) {
//   //   return 0;
//   // } else if (ping_dist >= 55) {
//   //   return 20;
//   // } else if (ping_dist >= 44) {
//   //   return 40;
//   // } else if (ping_dist >= 35) {
//   //   return 60;
//   // } else if (ping_dist >= 20) {
//   //   return 80;
//   // } else {
//   //   return 100;
//   // }
//   //   console.log("PING DISTTTTTTTTTT: "+ ping_dist);
//   // let total_cm = 70;
//   // if (ping_dist > total_cm) {
//   //     ping_dist = 70;
//   // }
//   // return Math.round((total_cm - ping_dist) * 100 / total_cm);
// };

// const getFeedLevelData = async (req, res) => {
//   let date_now = new Date();
//   let date_pre = date_now - 518400000; //432000000;

//   date_now = new Date(date_now);
//   date_pre = new Date(date_pre);

//   var loggedInUserId = req.session?.user?.id;
//   if (!loggedInUserId) {
//     loggedInUserId = "";
//   } else {
//     loggedInUserId = `AND UserDevices.user_id = ${loggedInUserId}`;
//   }
//   const query = `SELECT
//                         FeedingDevices.id,
//                         FeedingDevices.title,
//                         FeedingDevices.mac_address,
//                         FeedingDevices.location,
//                         FeedingDevices.other_info,
//                         FeedingDevices.feeder_id
//                     FROM
//                         FeedingDevices
//                     INNER JOIN
//                         UserDevices ON UserDevices.feeder_id = FeedingDevices.id
//                     WHERE
//                         1=1 ${loggedInUserId}`;
//   const records = await models.sequelize.query(query, {
//     type: QueryTypes.SELECT,
//   });

//   let newAr = {};
//   let LowFeedLevels = [];
//   let AllFeedLevels = [];
//   for (i = 0; i < records.length; i++) {
//     let feederId = records[i].id;
//     let tankLevel = await getFeedPercentage(feederId);
//     let myNewAr = {
//       id: feederId,
//       tankLevel: tankLevel,
//       title: records[i].title,
//       location: records[i].location,
//       other_info: records[i].other_info,
//     };
//     AllFeedLevels.push(myNewAr);
//     if (tankLevel <= 30) {
//       LowFeedLevels.push(feederId);
//     }
//   }
//   newAr = {
//     all: AllFeedLevels,
//     all_c: AllFeedLevels.length,
//     low_c: LowFeedLevels.length,
//   };
//   res.status(200).send(newAr);
// };
// const getFeedPercentage = async (feederId) => {
//   // Fetch tank capacity and current feed level from FeedingDevices table
//   const feedingDevice = await models.FeedingDevices.findOne({
//     where: {
//       id: feederId,
//     },
//     attributes: ["tank_capacity", "feed_level"],
//   });

//   if (!feedingDevice) {
//     throw new Error(`Feeding device with id ${feederId} not found`);
//   }

//   const { tank_capacity, feed_level } = feedingDevice;

//   // Calculate the feed level percentage
//   const feedLevelPercentage = (feed_level / tank_capacity) * 100;

//   return feedLevelPercentage;
// };
// const getFeedPercentage = async (feederId) => {
//   const tankCapacity = 800; // Assuming a constant tank capacity as you mentioned earlier

//   // Fetch feeding done records from 11/6 until now
//   const startDate = new Date("2024-06-11");
//   const endDate = new Date();

//   const feedingDoneRecords = await models.FeedingDone.findAll({
//     where: {
//       feeder_id: feederId,
//       createdAt: {
//         [Op.between]: [startDate, endDate],
//       },
//     },
//   });

//   let totalFeedUsed = 0;

//   // Calculate feed used based on feeding done records
//   feedingDoneRecords.forEach((record) => {
//     const clientMessage = JSON.parse(record.client_message);
//     const milliseconds = parseInt(clientMessage["61"], 10);
//     const seconds = milliseconds / 1000;
//     totalFeedUsed += seconds * 0.4;
//   });

//   const adjustedFeedUsed = Math.max(0, totalFeedUsed);
//   const remainingFeed = tankCapacity - adjustedFeedUsed;
//   const feedLevelPercentage = (remainingFeed / tankCapacity) * 100;

//   return feedLevelPercentage;
// };

const getFeedPercentage = async (feederId) => {
  const tankCapacity = 800; // Assuming a constant tank capacity
  const startDate = new Date("2024-06-11");
  const endDate = new Date(); // Current date and time

  console.log(
    `Fetching records from ${startDate.toISOString()} to ${endDate.toISOString()}`
  );

  try {
    // Fetch feeding done records from 2024-06-11 until now
    const feedingDoneRecords = await models.FeedingDone.findAll({
      where: {
        feeder_id: feederId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    console.log(
      `Fetched ${feedingDoneRecords.length} records from the database.`
    );

    let totalFeedUsed = 0;

    // Calculate feed used based on feeding done records
    feedingDoneRecords.forEach((record) => {
      try {
        const clientMessage = JSON.parse(record.client_message);
        const milliseconds = parseInt(clientMessage["61"], 10);
        console.log(
          `Parsed milliseconds: ${milliseconds} from record: ${record.client_message}`
        );
        if (!isNaN(milliseconds)) {
          const seconds = milliseconds / 1000;
          totalFeedUsed += seconds * 0.4;
          console.log(`Total feed used so far: ${totalFeedUsed}`);
        } else {
          console.warn(
            `Skipping record with invalid milliseconds: ${record.client_message}`
          );
        }
      } catch (error) {
        console.error(
          `Error parsing client_message for record: ${record.client_message}`,
          error
        );
      }
    });

    const adjustedFeedUsed = Math.max(0, totalFeedUsed);
    const remainingFeed = tankCapacity - adjustedFeedUsed;
    const feedLevelPercentage = (remainingFeed / tankCapacity) * 100;

    console.log(
      `Total feed used: ${totalFeedUsed}, Remaining feed: ${remainingFeed}, Feed level percentage: ${feedLevelPercentage}%`
    );

    return feedLevelPercentage;
  } catch (error) {
    console.error("Error fetching feeding done records:", error);
    throw error;
  }
};

const getFeedLevelData = async (req, res) => {
  const loggedInUserId = req.session?.user?.id;

  const query = `
    SELECT
      FeedingDevices.id,
      FeedingDevices.title,
      FeedingDevices.mac_address,
      FeedingDevices.location,
      FeedingDevices.other_info,
      FeedingDevices.feeder_id
    FROM
      FeedingDevices
    INNER JOIN
      UserDevices ON UserDevices.feeder_id = FeedingDevices.id
    WHERE
      1=1 ${loggedInUserId ? `AND UserDevices.user_id = ${loggedInUserId}` : ""}
  `;

  try {
    const records = await models.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    let newAr = {};
    let LowFeedLevels = [];
    let AllFeedLevels = [];

    for (let i = 0; i < records.length; i++) {
      const { id, title, location, other_info } = records[i];
      const tankLevel = await getFeedPercentage(id);

      const myNewAr = {
        id,
        tankLevel,
        title,
        location,
        other_info,
      };

      AllFeedLevels.push(myNewAr);
      if (tankLevel <= 30) {
        LowFeedLevels.push(id);
      }
    }

    newAr = {
      all: AllFeedLevels,
      all_c: AllFeedLevels.length,
      low_c: LowFeedLevels.length,
    };

    res.status(200).send(newAr);
  } catch (error) {
    res.status(500).send({ message: "Error fetching feed level data.", error });
  }
};

const getFeedLocations = async (req, res) => {
  let data = await models.FeedingDevices.findAll();
};

const updateTankCapacity = async (req, res) => {
  const { feederId, newTankCapacity } = req.body;
  try {
    const device = await models.FeedingDevices.findOne({
      where: { id: feederId },
    });
    if (device) {
      await models.FeedingDevices.update(
        { tank_capacity: newTankCapacity },
        { where: { id: feederId } }
      );
      res.status(200).send({ message: "Tank capacity reset successfully." });
    } else {
      res.status(404).send({ message: "Feeding device not found." });
    }
  } catch (error) {
    res.status(500).send({ message: "Error resetting tank capacity.", error });
  }
};
const refillTank = async (req, res) => {
  const { feederId } = req.body;
  try {
    const device = await models.FeedingDevices.findOne({
      where: { id: feederId },
    });
    if (device) {
      const now = new Date();
      await models.FeedingDevices.update(
        {
          feed_level: device.tank_capacity,
          last_refill: now,
        },
        { where: { id: feederId } }
      );
      res.status(200).send({ message: "Tank refilled to 100%." });
    } else {
      res.status(404).send({ message: "Feeding device not found." });
    }
  } catch (error) {
    res.status(500).send({ message: "Error refilling tank.", error });
  }
};

const getFormatted = (str) => {
  let newDate =
    str.getFullYear() +
    "-" +
    (str.getMonth() + 1) +
    "-" +
    str.getDate() +
    " " +
    str.getHours() +
    ":" +
    str.getMinutes() +
    ":" +
    str.getSeconds();
  return newDate;
};
const getSchedulesSummary = async (req, res) => {
  let date_now = new Date();
  let date_pre = date_now - 432000000;
  date_pre = new Date(date_pre);
  //dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");

  let dateFrom = getFormatted(date_pre);
  let dateTo = getFormatted(date_now);

  console.log("Date From: " + dateFrom);
  console.log("Date To: " + dateTo);

  const query =
    "select createdAt, client_message from ClientMessages where client_topic='response' and createdAt BETWEEN '" +
    dateFrom +
    "' and '" +
    dateTo +
    "' order by id desc";
  const records = await models.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });
  let myAr = { sunset: 0, sunrise: 0, fixed: 0 };
  if (records) {
    records.map((val) => {
      let createdAt = val.createdAt;
      let myDate = new Date(createdAt);

      let data = val.client_message;
      let jsonData = JSON.parse(data);
      if (jsonData[0] == "query_feed_timing_reply") {
        myAr["fixed"] += 1;
      } else {
        if (myDate.getHours >= "00" && myDate.getHours < "12") {
          myAr["sunrise"] += 1;
        } else {
          myAr["sunset"] += 1;
        }
      }
    });
    res.status(200).send(myAr);
  } else {
    res.status(200).send(myAr);
  }
};

const getAllNotifications = async (req, res) => {
  //sensors health
  //sensors reading
  let feedData = await models.Notifications.findOne({
    where: {
      createdAt: { [Op.gt]: "2023-11-01 01:00:00" },
      [Op.or]: [
        {
          [Op.and]: [
            { client_topic: "sensorstatus" },
            { client_message: { '"8"': { [Op.lt]: 11.5 } } },
          ],
        },
        {
          [Op.and]: [
            { client_topic: "sensorstatus" },
            { client_message: { '"5"': { [Op.lt]: 20 } } },
          ],
        },
        {
          [Op.and]: [
            { client_topic: "sensorworking" },
            { client_message: { '"Motor"': '"N"' } },
          ],
        },
        {
          [Op.and]: [
            { client_topic: "sensorworking" },
            { client_message: { '"BtyVoltage"': '"N"' } },
          ],
        },
        {
          [Op.and]: [
            { client_topic: "sensorworking" },
            { client_message: { '"BtyCurrent"': '"N"' } },
          ],
        },
        {
          [Op.and]: [{ client_topic: "feedingdone" }],
        },
      ],
    },
    order: [["id", "DESC"]],
    limit: 15,
  });

  console.log(feedData);
  process.exit(0);
  if (feedData !== null) {
    const response = {
      status: true,
      data: feedData,
    };
    res.status(200).json(response);
  } else {
    res.status(200).json({ success: false });
  }
};

const getFeedDateTimes = async (req, res) => {
  let feeder_id = req.params.feederId;
  const data = await collectSchedules(feeder_id);
  if (data !== false) {
    res.status(200).json(data);
  } else {
    res.status(200).json(false);
  }
};

module.exports = {
  getFeedLevelData,
  getFeedLocations,
  getSchedulesSummary,
  getAllNotifications,
  getFeedDateTimes,
  updateTankCapacity,
  refillTank,
};
