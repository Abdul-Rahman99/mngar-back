const models = require("../models");
// var json2csv = require('json2csv');
const { QueryTypes } = require("sequelize");
const getCsv = async (req, res) => {
  let reqData = req.params.reqData;
  if (reqData == "fd") {
    let data = await models.FeedingDone.findAll({
      order: [["id", "DESC"]],
      limit: 200,
    });
    if (data !== null) {
      let csv = "id, message,feeder_id, date" + "\n";
      data.map((val) => {
        // let msg = val.client_message.toString().replaceAll('"', '\\"');
        let msg = val.client_message.toString().toString().replaceAll(",", "-");
        csv +=
          '"' +
          val.id +
          '","' +
          msg +
          '","' +
          val.feeder_id +
          '","' +
          val.createdAt +
          '"' +
          "\n";
      });
      res.attachment("feedingdones.csv");
      res.status(200).send(csv);
    }
  } else if (reqData == "re") {
    let data = await models.ClientMessages.findAll({
      where: {
        client_topic: "response",
      },
      order: [["id", "DESC"]],
      limit: 200,
    });
    if (data !== null) {
      let csv = "id, message,feeder_id, date" + "\n";
      data.map((val) => {
        // let msg = val.client_message.toString().replaceAll('"', '\\"');
        let msg = val.client_message.toString().toString().replaceAll(",", "-");
        csv +=
          '"' +
          val.id +
          '","' +
          msg +
          '","' +
          val.feeder_id +
          '","' +
          val.createdAt +
          '"' +
          "\n";
      });
      res.attachment("response.csv");
      res.status(200).send(csv);
    }
  } else if (reqData == "fs") {
    let data = await models.ClientMessages.findAll({
      where: {
        client_topic: "feedsetting",
      },
      order: [["id", "DESC"]],
      limit: 200,
    });
    if (data !== null) {
      let csv = "id, message,feeder_id, date" + "\n";
      data.map((val) => {
        // let msg = val.client_message.toString().replaceAll('"', '\\"');
        let msg = val.client_message.toString().toString().replaceAll(",", "-");
        csv +=
          '"' +
          val.id +
          '","' +
          msg +
          '","' +
          val.feeder_id +
          '","' +
          val.createdAt +
          '"' +
          "\n";
      });
      res.attachment("feedsetting.csv");
      res.status(200).send(csv);
    }
  } else if (reqData == "al") {
    let data = await models.AuditLogs.findAll({
      order: [["id", "DESC"]],
      limit: 200,
    });
    if (data !== null) {
      let csv = "id, command,user_id, date" + "\n";
      data.map((val) => {
        // let msg = val.client_message.toString().replaceAll('"', '\\"');
        let user = val.user_id ? val.user_id : "cron";
        csv +=
          '"' +
          val.id +
          '","' +
          val.command +
          '","' +
          user +
          '","' +
          val.createdAt +
          '"' +
          "\n";
      });
      res.attachment("auditlogs.csv");
      res.status(200).send(csv);
    }
  } else {
  }
};
// const getExportedData = async (req, res) => {
//   const { deviceId, date } = req.params;

//   const query = `
//         SELECT
//             DATE(createdAt) as date,
//             birdcount
//         FROM
//             BirdsData
//         WHERE
//             feeder_id = :deviceId AND 
//             DATE(createdAt) = :date
//         ORDER BY
//             createdAt ASC
//     `;

//   try {
//     const birdsData = await models.sequelize.query(query, {
//       replacements: { deviceId, date },
//       type: QueryTypes.SELECT,
//     });

//     if (birdsData.length > 0) {
//       let csv = "date, birdcount\n";
//       birdsData.forEach(({ date, bird_count }) => {
//         csv += `"${date}", "${bird_count}"\n`;
//       });
//       res.attachment("birdsdata.csv");
//       res.status(200).send(csv);
//     } else {
//       res.status(404).send("No data found for the given device and date");
//     }
//   } catch (error) {
//     res.status(500).json({
//       message: "An error occurred while fetching the data",
//       error: error.message,
//     });
//   }
// };
module.exports = { getCsv };
