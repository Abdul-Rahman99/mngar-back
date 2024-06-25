const models = require("../models");
const { QueryTypes, Op } = require("sequelize");
var moment = require("moment");
const { collectSchedules } = require("../Helper");
const { Parser } = require("json2csv");
const getDevices = async (req, res) => {
  try {
    const feederDevices = await models.FeedingDevices.findAll();
    const response = {
      status: true,
      data: feederDevices,
    };
    if (feederDevices) {
      res.status(200).json(response);
    } else {
      res.status(200).json({ status: false, data: "No devices found" });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ status: false, data: "No devices found" });
  }
};
const addDevice = async (req, res) => {
  try {
    let feedDevice;
    const {
      isNew,
      id,
      title,
      feeder_id,
      mac_address,
      camera_mac_address,
      location,
      ip_address,
      longitude,
      latitude,
    } = req.body;

    const other_info = JSON.stringify({
      latitude: latitude,
      longitude: longitude,
    });

    if (
      !(title && feeder_id && mac_address && camera_mac_address && ip_address)
    ) {
      res
        .status(200)
        .send(
          "Title Feeder ID Mac Address Camera Mac Address and IP address are required"
        );
    }

    if (isNew) {
      const oldFeedingDevice = await models.FeedingDevices.findOne({
        where: { title: title },
      });

      if (oldFeedingDevice) {
        return res.status(409).send("Feeding Device Already Exist");
      }
      feedDevice = await models.FeedingDevices.create({
        title,
        feeder_id,
        mac_address,
        camera_mac_address,
        location,
        ip_address,
        other_info,
      });
    } else {
      feedDevice = await models.FeedingDevices.update(
        {
          title,
          feeder_id,
          mac_address,
          camera_mac_address,
          location,
          ip_address,
          other_info,
        },
        { where: { id: id } }
      );
    }
    const response = {
      status: true,
      data: feedDevice,
    };
    res.status(200).send(response);
  } catch (err) {
    const response = {
      status: false,
      data: err,
    };
    res.status(500);
  }
};
const getFeedingDevices = () => {};

const getDeviceDetails = async (req, res) => {
  let feeder_id = req.params.feederId;
  // console.log(req.params.feederId)
  const device = await models.FeedingDevices.findOne({
    where: { id: feeder_id },
  });

  if (device !== null) {
    let schData = await collectSchedules(feeder_id);
    const response = {
      status: true,
      data: device,
      schedule_data: schData,
    };
    res.status(200).json(response);
  } else {
    res.status(200).json({ success: false });
  }
};
const getAllBirdsData = async (req, res) => {
  // let feeder_id = req.params.feederId;
  // console.log(req.params.feederId)
  const birdsdata = await models.BirdsDataNew.findAll({
    order: [["id", "DESC"]],
  });

  if (birdsdata !== null) {
    const response = {
      status: true,
      data: birdsdata,
    };
    res.status(200).json(response);
  } else {
    res.status(200).json({ success: false });
  }
};
const getFormatted = (str) => {
  // let newDate = str.getFullYear() + "-" + (str.getMonth() + 1) + "-" + str.getDate() + " " + str.getHours() + ":" + str.getMinutes() + ":" + str.getSeconds();
  let newDate =
    str.getFullYear() + "-" + (str.getMonth() + 1) + "-" + str.getDate();
  return newDate;
};
const getFeedDataByDate = async (date, feederId) => {
  const birdsdata = await models.FeedingDone.findOne({
    attributes: [
      [models.sequelize.fn("COUNT", models.sequelize.col("id")), "feed"],
    ],
    where: {
      [Op.and]: [
        {
          feeder_id: feederId,
        },
        models.sequelize.where(
          models.sequelize.fn("date", models.sequelize.col("createdAt")),
          "=",
          "2023-12-06"
        ),
      ],
    },
    raw: true,
  });
  if (birdsdata !== null) {
    return birdsdata;
  } else {
    return null;
  }
};
const getBirdsData = async (req, res) => {
  let date_now = new Date();
  // let date_pre = date_now - 604800000; //518400000; //432000000;
  let date_pre = date_now - 518400000; //432000000;

  date_now = new Date(date_now);
  date_pre = new Date(date_pre);

  let sdatefrom = getFormatted(date_pre);
  let sdateto = getFormatted(date_now);
  let feederId = req.params.feederId;
  // var duration = moment.duration(moment(date_now).diff(moment(date_pre)))
  // let duration_diff = duration.asDays();

  const query =
    "select sum(client_message) as 'birdscount', DATE(createdAt) as 'date', TIME(createdAt) as 'time' " +
    "from BirdsData " +
    "where /*feeder_id = '" +
    feederId +
    "' and*/ " +
    "(client_topic = 'Processed1birdalert' OR client_topic = 'Processed2birdalert') and " +
    "DATE(createdAt) BETWEEN '" +
    sdatefrom +
    "' and '" +
    sdateto +
    "' " +
    "group by DATE(createdAt)";
  console.log("Query", query);
  const birdsdata = await models.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });
  if (birdsdata !== null) {
    let myAr = [];
    for (i = 0; i < birdsdata.length; i++) {
      let getDate = birdsdata[i].date;

      // let consdata = getFeedDataByDate(getDate, feederId);
      const consdata = await models.FeedingDone.findOne({
        attributes: [
          [models.sequelize.fn("COUNT", models.sequelize.col("id")), "feed"],
        ],
        where: {
          [Op.and]: [
            {
              feeder_id: feederId,
            },
            models.sequelize.where(
              models.sequelize.fn("date", models.sequelize.col("createdAt")),
              "=",
              getDate
            ),
          ],
        },
        raw: true,
      });

      console.log(consdata);
      let feed_max = consdata != null ? consdata.feed : 0;
      // let feed_max = 0;
      let myArIn = {
        time: birdsdata[i].time,
        date: birdsdata[i].date,
        birdscount: birdsdata[i].birdscount,
        foodconsumption: feed_max,
      };
      myAr.push(myArIn);
    }
    // birdsdata.forEach((val) => {
    //     let getDate = val.date;

    //     let consdata = getFeedDataByDate(getDate, feederId);
    //     console.log(consdata)
    //     let feed_max = consdata != null ? consdata.feed : 0;
    //     // let feed_max = 0;
    //     let myArIn = {
    //         time: val.time,
    //         date: val.date,
    //         birdscount: val.birdscount,
    //         foodconsumption: feed_max
    //     };
    //     myAr.push(myArIn);

    // })
    // birdsdata.map((val, i) => {
    //     let getDate = val.date;

    //     let consdata = getFeedDataByDate(getDate, feederId);
    //     console.log(consdata)
    //     let feed_max = consdata != null ? consdata.feed : 0;
    //     // let feed_max = 0;
    //     let myArIn = {
    //         time: val.time,
    //         date: val.date,
    //         birdscount: val.birdscount,
    //         foodconsumption: feed_max
    //     };
    //     myAr.push(myArIn);
    // })
    const response = {
      status: true,
      data: myAr,
    };
    res.status(200).json(response);
  } else {
    res.status(200).json({ success: false });
  }
  // process.exit(0)
};

const getTimeAMPM = (timeStr = "00:00") => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return moment({ hours, minutes }).format("hh:mm A");
};

const getBirdsDataForGraph = async (req, res) => {
  const {
    datefrom = moment().utcOffset("+0400").format("YYYY-MM-DD"),
    sfilter = "Daily",
    feederId,
  } = req.params;

  let sdateto,
    timeRangeGroupByField = "";

  switch (sfilter) {
    case "Daily":
      timeRangeGroupByField = `CONCAT(HOUR(createdAt), ":", MINUTE(createdAt))`;
      sdateto = datefrom;
      break;
    case "Weekly":
      timeRangeGroupByField = "DATE(createdAt)";
      sdateto = moment(datefrom).add("6", "days").format("YYYY-MM-DD");
      break;
    case "Monthly":
      timeRangeGroupByField = "DATE(createdAt)";
      sdateto = moment(datefrom).add("29", "days").format("YYYY-MM-DD");
      break;
    case "Yearly":
      timeRangeGroupByField = "MONTHNAME(createdAt)";
      sdateto = moment(datefrom).add("359", "days").format("YYYY-MM-DD");
      break;
    default:
      timeRangeGroupByField = `CONCAT(HOUR(createdAt), ":", MINUTE(createdAt))`;
      sdateto = datefrom;
  }

  const queryCam1 = `
        SELECT
            ${timeRangeGroupByField} as time,
            CONCAT(
    '[',
    GROUP_CONCAT(UPPER(json_extract(client_message, '$.species_detected'))),
    ']'
            ) as speciesInfo,
            MAX(json_extract(client_message, '$.countBirds')) as maxCount
        
        FROM
            BirdsData
        
        WHERE
            feeder_id = ${feederId} AND 
            client_topic in ('Processed1json') AND
            DATE(createdAt) BETWEEN '${datefrom}' AND '${sdateto}'
       
        GROUP BY
            time

        ORDER BY
            createdAt ASC
    `;

  const queryCam2 = `
        SELECT
            ${timeRangeGroupByField} as time,
            CONCAT(
    '[',
    GROUP_CONCAT(UPPER(json_extract(client_message, '$.species_detected'))),
    ']'
            ) as speciesInfo,
            MAX(json_extract(client_message, '$.countBirds')) as maxCount
        
        FROM
            BirdsData
        
        WHERE
            feeder_id = ${feederId} AND 
            client_topic in ('Processed2json') AND
            DATE(createdAt) BETWEEN '${datefrom}' AND '${sdateto}'
       
        GROUP BY
            time

        ORDER BY
            createdAt ASC
    `;

  const birdsDataCam1 = await models.sequelize.query(queryCam1, {
    type: QueryTypes.SELECT,
  });

  const birdsDataCam2 = await models.sequelize.query(queryCam2, {
    type: QueryTypes.SELECT,
  });

  let birdsData;
  const birdspiedata = new Map();
  const data = new Map();

  for (let index = 0; index < birdsDataCam1.length; index++) {
    const elementCam1 = birdsDataCam1[index];
    const elementCam2 = birdsDataCam2[index];

    if(elementCam1.time == elementCam2.time){
      birdsData[index].time = elementCam1.time;
      birdsData[index].maxCount = elementCam1.maxCount + elementCam2.maxCount;
      birdsData[index].speciesInfo = elementCam1.speciesInfo + elementCam2.speciesInfo;
    }
  }

  birdsData?.forEach(({ time, speciesInfo, maxCount }) => {
    // append data for pie graph
    JSON.parse(speciesInfo)?.forEach((species_detected_arr) => {
      species_detected_arr?.forEach((specie) => {
        const specieCount = birdspiedata.get(specie);
        birdspiedata.set(specie, specieCount ? specieCount + 1 : 1);
      });
    });

    // append data for dot graph
    const formatedTime = `${time}`.includes(":") ? getTimeAMPM(time) : time;
    data.set(formatedTime, maxCount);
  });

  if (birdsData !== null) {
    const response = {
      status: true,
      birdspiedata: {
        labels: Array.from(birdspiedata.keys()),
        values: Array.from(birdspiedata.values()),
      },
      data: {
        time: Array.from(data.keys()),
        birds: Array.from(data.values()),
      },
    };

    res.status(200).json(response);
  } else res.status(200).json({ success: false });
};

const getExportedData = async (req, res) => {
  const {
    feederId,
    date = moment().utcOffset("+0400").format("YYYY-MM-DD"),
    sfilter = "Daily",
  } = req.params;

  if (!feederId) {
    return res
      .status(400)
      .json({ success: false, message: "feederId is required" });
  }

  let sdateto,
    timeRangeGroupByField = "";

  switch (sfilter) {
    case "Daily":
      timeRangeGroupByField = `CONCAT(HOUR(createdAt), ":", MINUTE(createdAt))`;
      sdateto = date;
      break;
    case "Weekly":
      timeRangeGroupByField = "DATE(createdAt)";
      sdateto = moment(date).add(6, "days").format("YYYY-MM-DD");
      break;
    case "Monthly":
      timeRangeGroupByField = "DATE(createdAt)";
      sdateto = moment(date).add(29, "days").format("YYYY-MM-DD");
      break;
    case "Yearly":
      timeRangeGroupByField = "MONTHNAME(createdAt)";
      sdateto = moment(date).add(359, "days").format("YYYY-MM-DD");
      break;
    default:
      timeRangeGroupByField = `CONCAT(HOUR(createdAt), ":", MINUTE(createdAt))`;
      sdateto = date;
  }

  const query = `
        SELECT
            ${timeRangeGroupByField} as time,
            CONCAT(
                '[',
                GROUP_CONCAT(json_extract(client_message, '$.species_detected')),
                ']'
            ) as speciesInfo,
            MAX(json_extract(client_message, '$.countBirds')) as maxCount
        
        FROM
            BirdsData
        
        WHERE
            feeder_id = :feederId AND 
            client_topic in ('Processed1json', 'Processed2json') AND
            DATE(createdAt) BETWEEN :date AND :sdateto
       
        GROUP BY
            time

        ORDER BY
            createdAt ASC
    `;

  try {
    const birdsData = await models.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { feederId, date, sdateto },
    });

    const csvData = birdsData.map(({ time, speciesInfo, maxCount }) => {
      const formattedTime = `${time}`.includes(":") ? getTimeAMPM(time) : time;
      return {
        time: formattedTime,
        speciesInfo: speciesInfo,
        maxCount: maxCount,
      };
    });

    console.log("CSV Data:", csvData);

    if (csvData.length > 0) {
      const fields = ["time", "speciesInfo", "maxCount"];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);

      console.log("Generated CSV:", csv);

      res.header("Content-Type", "text/csv");
      res.attachment("birdsData.csv");
      res.send(csv);
    } else {
      console.log("No data available for CSV generation");
      res.status(200).json({
        success: false,
        message: "No data available for the specified parameters.",
      });
    }
  } catch (error) {
    console.error("Error fetching exported data:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the data",
      error: error.message,
    });
  }
};

const updateFeederStatus = async (req, res) => {
  try {
    let feedDevice;

    feedDevice = await models.FeedingDevices.update(
      {
        status: req.body.status,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );

    const response = {
      status: true,
      data: feedDevice,
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500);
  }
};

const deleteFeeder = async (req, res) => {
  try {
    await models.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    await models.FeedingDevices.destroy({
      where: {
        id: req.params.id,
      },
    });

    await models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    const response = {
      status: true,
      data: "Feeder deleted successfully",
    };
    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: false,
      error: err.message,
    });
  }
};

const getBirdsDataForAdmin = async (req, res) => {
  const page = req.params.page || 1; // Replace with the desired page number
  const pageSize = req.params.pageSize || 10; // Replace with the desired page size
  const clientTopicFilter = ["Processed1birdalert", "Processed2birdalert"];

  const offset = (page - 1) * pageSize;

  try {
    const result = await models.BirdsData.findAndCountAll({
      where: {
        client_topic: {
          [Op.in]: clientTopicFilter,
        },
      },
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset: offset,
    });

    const { rows, count } = result;
    const totalPages = Math.ceil(count / pageSize);

    const response = {
      status: true,
      data: rows,
      totalRows: count,
      totalPages: totalPages,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getDevices,
  addDevice,
  getDeviceDetails,
  getBirdsData,
  updateFeederStatus,
  deleteFeeder,
  getAllBirdsData,
  getFeedingDevices,
  getBirdsDataForGraph,
  getBirdsDataForAdmin,
  getExportedData,
};
