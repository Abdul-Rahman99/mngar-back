var { subscribeTopics, client } = require("../mqtt");
subscribeTopics();
var {
  io,
  splitStr,
  postSocketMessage,
  postSocketNotification,
} = require("../socket");
const models = require("../models");

const { DataTypes, Op, QueryTypes } = require("sequelize");
const { Buffer } = require("buffer");
var moment = require("moment");
const fs = require("fs");

const sharp = require("sharp");
const { exit } = require("process");

var isProcessing = false;
const ProcessCameraData = (topic, message) => {
  return new Promise((resolve, reject) => {
    var readStream = fs.createReadStream("./public/" + message.key, {
      encoding: "binary",
      highWaterMark: 4096 * 1024,
    });
    // , highWaterMark: 3072 * 1024

    let file = [];
    readStream.on("data", function (chunk) {
      isProcessing = true;
      file.push(chunk);
      io.emit("cam-event", topic, isProcessing, chunk);
      console.log("stream data");
    });
    readStream.on("error", (e) => {
      reject(e);
    });

    readStream.on("open", () => {
      isProcessing = true;
      console.log("Stream opened");
    });
    readStream.on("ready", () => {
      isProcessing = true;
      console.log("Stream ready");
    });
    return readStream.on("end", function () {
      // console.log('file', file); // This logs the file buffer
      console.log("Stream end"); // This logs the file buffer
      // setTimeout(() => { isProcessing = false }, 2000);
      isProcessing = false;
      io.emit("cam-event", topic, isProcessing, "");
      // setTimeout(() => {
      //     console.log('Stream end timeout');
      // }, 3000);
      // fs.writeFileSync("./public/" + message.key, "");
      // fs.unlink("./public/" + message.key, (err) => {

      // });
      resolve(file);
    });
  });
};
const postSocketMessageCamera = (topic, message, feeder_id) => {
  console.log("camera socket message: " + topic);

  // io.emit("cam-event", topic, message, feeder_id)

  io.emit("custom-event", topic, message, feeder_id);

  // if (isProcessing == false)
  //     await ProcessCameraData(topic, message);
};

const ImageProcessing = async (message, filename) => {
  return new Promise((resolve, reject) => {
    // fs.writeFileSync("../../" + filename, Buffer.from(message, 'binary'));
    // var transformed = sharp(Buffer.from(message, 'binary')).resize(1280, 800);
    //fs.writeFileSync("./public/" + filename, transformed);
    try {
      sharp(Buffer.from(message, "binary"))
        .resize(640, 400)
        // .resize(340, 200)
        .toFile("./public/" + filename, (err, info) => {
          if (err) {
            reject(err);
          } else {
            resolve(info);
          }
        });
    } catch (err) {
      resolve(err);
    }
    // .then(data => { resolve(data) })
    // .catch(err => { reject(err); });
    // resolve(file);
    // reject(e);
    // fs.writeFile("./public/" + filename, Buffer.from(message, 'binary'), function (err, data) {
    //     if (!err) {
    //         sharp(Buffer.from(message, 'binary'))
    //             .resize(680, 400)
    //             .toFile("./public/" + filename, (err, info) => {

    //             });
    //     }
    // })
    // fs.open("./public/" + filename, "wx", function (err, fd) {
    //     // handle error
    //     if (!err) {
    //         sharp(Buffer.from(message, 'binary'))
    //             .resize(640, 400)
    //             .toFile("./public/" + filename, (err, info) => {

    //             });

    //     }

    // });
  });
};
var counter = 0;
client.on("message", async function (topic, message) {
  // called each time a message is received

  //console.log('\nReceived message:\nTopic: ', topic, '\nMessage: ', message.toString(), '\n');

  var client_topic = topic;
  var client_message = message.toString();
  var feeder_id;

  // Code to modify topic

  let splited_topic = splitStr(client_topic, "/");
  var topic_length = Object.keys(splited_topic).length;
  var getLastElem = splited_topic[topic_length - 1];
  var mainTopicHead = splited_topic[1];

  // console.log(mainTopicHead);
  // exit(0)
  feeder_id = splited_topic[1];

  let cameraKey = false;
  let myCamAry = ["image", "json", "birdalert"];
  if (topic_length >= 4) {
    if (
      myCamAry.includes(splited_topic[topic_length - 1]) ||
      splited_topic[topic_length - 1] == "capture1" ||
      splited_topic[topic_length - 1] == "capture2"
    ) {
      let cameraTitle;
      let cameraMacAddress;

      if (topic_length > 4) {
        cameraTitle = splited_topic[topic_length - 2];
        cameraMacAddress = splited_topic[topic_length - 3];
      } else {
        cameraTitle = splited_topic[topic_length - 1];
        cameraMacAddress = splited_topic[topic_length - 2];
      }

      let cameraMacData = await models.FeedingDevices.findOne({
        where: {
          camera_mac_address: cameraMacAddress,
        },
      });

      if (cameraMacData !== null) {
        // cameraMacData.id
        if (topic_length > 4) cameraTitle = splited_topic[topic_length - 2];
        else cameraTitle = splited_topic[topic_length - 1];
        cameraTitle = cameraTitle.toLowerCase();
        let CameraFeederId = cameraMacData.id;
        CameraFeederId = CameraFeederId.toString();

        if (
          myCamAry.includes(splited_topic[topic_length - 1]) &&
          splited_topic[topic_length - 1] != "image"
        ) {
          feeder_id = CameraFeederId;
          getLastElem =
            splited_topic[topic_length - 2] +
            "" +
            splited_topic[topic_length - 1];
          cameraKey = false;
        } else {
          cameraKey = true;
          getLastElem = CameraFeederId.concat(cameraTitle);
        }
      }
      // } else if (topic_length == 5) {
      //     getLastElem = splited_topic[topic_length - 2] + "" + splited_topic[topic_length - 1];
    } else if (
      topic_length >= 4 ||
      (topic_length == 3 && splited_topic[1] == "ctrl")
    ) {
      getLastElem =
        splited_topic[topic_length - 2] + "" + splited_topic[topic_length - 1];
    }
  }
  if (mainTopicHead != "Video") {
    let feedingdevice = await models.FeedingDevices.findOne({
      where: {
        feeder_id: feeder_id,
      },
    });

    if (feedingdevice !== null) {
      feeder_id = feedingdevice.id;
    }
  }
  if (mainTopicHead == "Video") {
    console.log("\n\n");
    console.log(cameraKey, getLastElem, topic_length, mainTopicHead);
    console.log("\n\n");
  }

  // Code for comma to replace if occur in internal data

  let position_1;
  let position_2;

  if (getLastElem == "sensorstatus") {
    position_1 = client_message.search("16<");
    position_2 = client_message.search(">16");
  } else if (getLastElem == "feedingdone") {
    position_1 = client_message.search("62<");
    position_2 = client_message.search(">62");
  }
  let result = client_message.substr(position_1, 20);
  let newresult = result.replaceAll(",", "'");

  //console.log(result)

  let newclient_message = client_message.replaceAt(position_1, newresult);

  //console.log(newclient_message)

  client_message = newclient_message;

  // Code to modify message to proper formatted json

  let newAr = {};
  let newArCapture = {};
  if (
    cameraKey ||
    getLastElem == "Processed1birdalert" ||
    getLastElem == "Processed2birdalert" ||
    getLastElem == "HB" ||
    getLastElem == "capture1" ||
    getLastElem == "capture2" ||
    getLastElem == "capture3" ||
    getLastElem == "capture4" ||
    getLastElem == "Processed1" ||
    getLastElem == "Processed2" ||
    getLastElem == "Processed1fgmask" ||
    getLastElem == "Processed2fgmask" ||
    getLastElem == "IMAGE" ||
    getLastElem == "Processed1SAM" ||
    getLastElem == "Processed2SAM" ||
    getLastElem == "ctrlHB"
  ) {
    if (
      cameraKey ||
      getLastElem == "Processed1" ||
      getLastElem == "Processed2" ||
      getLastElem == "capture1" ||
      getLastElem == "capture2" ||
      getLastElem == "capture3" ||
      cameraKey ||
      getLastElem == "capture4" ||
      getLastElem == "IMAGE" ||
      getLastElem == "Processed1SAM" ||
      getLastElem == "Processed2SAM"
    ) {
      let base64ImageString = Buffer.from(message, "binary").toString("base64");
      var dir = "./public";
      let random = Math.floor(
        Math.random() * (999999999999 - 111111111111) + 111111111111
      );
      if (!fs.existsSync(dir)) {0
        fs.mkdirSync(dir);
      }

      // if (getLastElem == "Processed1" || getLastElem == "Processed2" || getLastElem == "capture1" || getLastElem == "capture2") {
      if (
        cameraKey ||
        getLastElem == "Processed1" ||
        getLastElem == "Processed2" ||
        getLastElem == "capture3" ||
        getLastElem == "capture4"
      ) {
        let filename = getLastElem + ".png";
        ImageProcessing(message, filename).catch((err) =>
          console.log(`img proc error : ${err}`)
        );

        newArCapture["key"] = filename + "?v=" + random;
      }
      newAr["key"] = base64ImageString;
      // newArCapture["key"] = filename;
      // newArCapture["key"] = getLastElem;
      // newArCapture["key"] = base64ImageString;
    } else {
      // if (message.toString() != "nobird")
      newAr["key"] = message.toString();
    }
  } else {
    // let splited_message = splitStr(client_message, /[0-9],[1-9]/gm);
    if (getLastElem == "Processed1json" || getLastElem == "Processed2json") {
      // newAr = JSON.parse(client_message.trim());

      newAr = message.toString();
      // console.log("\n\n\n")
      // console.log("JSON1\n", message.toString())
      // console.log("\n\n\n")
      // console.log("JSON2\n", newAr)
      // console.log("\n\n\n")
    } else {
      let splited_message = splitStr(client_message, ",");
      splited_message.forEach((element) => {
        let ind_rec;
        if (getLastElem == "sensorworking") {
          ind_rec = splitStr(element, "=");
        } else {
          ind_rec = splitStr(element, /<|>/g);
        }

        if (Object.keys(ind_rec).length > 1) {
          newAr[ind_rec[0]] = ind_rec[1];
        } else {
          newAr["key"] = ind_rec[1];
        }
      });
    }
  }

  if (
    cameraKey ||
    getLastElem == "capture1" ||
    getLastElem == "capture2" ||
    getLastElem == "Processed1" ||
    getLastElem == "Processed2" ||
    getLastElem == "Processed1fgmask" ||
    getLastElem == "Processed2fgmask" ||
    getLastElem == "Processed1SAM" ||
    getLastElem == "Processed2SAM"
  ) {
    let post = {
      client_message: JSON.stringify(newAr),
      client_topic: getLastElem,
      feeder_id: feeder_id,
    };
    // await models.CameraData.create(post).catch((error) => {
    //     if (error) {
    //         console.log("error in creation commands" + error)
    //     }
    // });
    // collectNotifications("camera", "", feeder_id);
  } else {
    if (getLastElem == "ctrlHB") {
      let post = {
        message: JSON.stringify(newAr),
        topic: getLastElem,
        feeder_id: feeder_id,
      };
      models.ServerMessages.create(post).catch((error) => {
        console.log("error in creation commands" + error);
      });
    } else if (
      getLastElem == "Processed1birdalert" ||
      getLastElem == "Processed2birdalert" ||
      getLastElem == "Processed1json" ||
      getLastElem == "Processed2json"
    ) {
      if (newAr) {
        //isInteger
        if (
          getLastElem == "Processed1birdalert" ||
          getLastElem == "Processed2birdalert"
        ) {
          // console.log("count birds: ", newAr.key, "\n\n\n")
          if (newAr.key != "nobird") {
            let bfound = splitStr(newAr.key, "birdfound");
            let bf_count;
            if (bfound.length > 1) {
              bf_count = bfound[1].trim();
            } else {
              bf_count = bfound[0].trim();
            }

            let post = {
              client_message: bf_count,
              client_topic: getLastElem,
              feeder_id: feeder_id,
            };
            models.BirdsData.create(post).catch((error) => {
              console.log("error in creation commands" + error);
            });
          }
        } else {
          let myNewAr = JSON.parse(newAr);
          if (myNewAr.countBirds > 0) {
            let post = {
              client_message: JSON.stringify(myNewAr),
              client_topic: getLastElem,
              feeder_id: feeder_id,
            };
            models.BirdsData.create(post).catch((error) => {
              console.log("error in creation commands" + error);
            });
          }
        }
        console.log("\n\n\n");
      }
    } else {
      let toSkip = false;
      // if (getLastElem == "feedingdone") {
      //     let w_status = await models.SensorWorking.findOne({
      //         order: [
      //             ['id', 'DESC']
      //         ],
      //         limit: 1
      //     });
      //     if (w_status !== null) {
      //         let c_msg = JSON.parse(w_status.client_message);
      //         if (c_msg.Motor == "N") {
      //             toSkip = true;
      //         }
      //     }
      // }
      if (!toSkip) {
        if (
          getLastElem == "sensorstatus" ||
          getLastElem == "sensorworking" ||
          getLastElem == "feedingdone"
        ) {
          let post = {
            client_message: JSON.stringify(newAr),
            feeder_id: feeder_id,
          };
          if (getLastElem == "sensorstatus") {
            models.SensorStatus.create(post).catch((error) => {
              console.log("error in creation commands" + error);
            });
          } else if (getLastElem == "sensorworking") {
            models.SensorWorking.create(post).catch((error) => {
              console.log("error in creation commands" + error);
            });
          } else {
            models.FeedingDone.create(post).catch((error) => {
              console.log("error in creation commands" + error);
            });
          }
          collectNotifications(getLastElem, newAr, feeder_id);
        } else if (mainTopicHead != "Video") {
          if (getLastElem == "HB") {
          } else {
            let post = {
              client_message: JSON.stringify(newAr),
              client_topic: getLastElem,
              feeder_id: feeder_id,
            };
            try {
              models.ClientMessages.create(post).catch((error) => {
                console.log("error in creation commands" + error);
              });
            } catch (err) {}
          }
        }
      }
    }
  }
  if (mainTopicHead == "Video") {
    if (
      cameraKey ||
      getLastElem == "Processed1" ||
      getLastElem == "Processed2" ||
      getLastElem == "capture3" ||
      getLastElem == "capture4"
    ) {
      console.log("\nReceived message:\nTopic: ", getLastElem, "\n");
      postSocketMessageCamera(getLastElem, newArCapture, feeder_id);
    }
  } else {
    console.log("\nReceived message:\nTopic: ", getLastElem, "\n");
    postSocketMessage(getLastElem, newAr, feeder_id);
  }
});

const collectNotifications = async (topic, message, feeder_id) => {
  let post = {
    client_message: message,
    client_topic: topic,
    feeder_id: feeder_id,
  };
  // models.Notifications.create(post).catch((error) => {
  //     if (error) {
  //         console.log("error in creation commands" + error)
  //     }
  // });

  let messageTopic = "";
  let messageText = "";
  let payload;
  // if (topic == "" && topic != "camera") {
  if (topic == "") {
    return;
  }
  // let cameraData = await models.NotificationAlerts.findOne({
  //     where: { message_topic: "camera" },
  //     order: [
  //         ['id', 'DESC']
  //     ],
  //     limit: 1
  // })
  // console.log("cameraData", cameraData);
  // if (cameraData != null) {
  //     let lastCameraArrival = cameraData.updatedAt;
  //     let now = new Date();
  //     var duration = moment.duration(moment(now).diff(moment(lastCameraArrival)))
  //     var seconds = duration.asSeconds();
  //     console.log("seconds", seconds);
  //     console.log("cameratrack", topic, lastCameraArrival, now);
  //     if (topic == "camera") {
  //         // var dateString = moment().utcOffset(420).format("YYYY-MM-DD H:mm:ss");
  //         payload = { createdAt: moment().utcOffset(420).format("YYYY-MM-DD H:mm:ss"), updatedAt: moment().utcOffset(420).format("YYYY-MM-DD H:mm:ss") };
  //         // await models.NotificationAlerts.update(payload, { where: { message_topic: "camera" } });
  //     } else if (seconds > 20 /*&& cameraData.message_text.search("not") < 0*/) {
  //         messageTopic = "camera"
  //         messageText = "Camera is not working";
  //         payload = { message_topic: messageTopic, message_text: messageText, feeder_id: "feeder_id" };
  //         // await models.NotificationAlerts.create(payload, { where: { message_topic: "camera" } });
  //         //FeedingDevices.title, NotificationAlerts.message_text, createdAt
  //         // postSocketNotification([])

  //     }
  // } else if (topic == "camera") {
  //     messageTopic = "camera"
  //     messageText = "camera is working";
  //     payload = { message_topic: messageTopic, message_text: messageText, feeder_id: "feeder_id" };
  //     // await models.NotificationAlerts.create(payload);
  // }

  if (topic == "sensorstatus") {
    //Temperature
    if (message["1"] > 60) {
      // temp 1
      messageTopic = "temperatureout";
      messageText = "external temperature seems very high";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }
    if (message["3"] > 60) {
      // temp 1
      messageTopic = "temperaturein";
      messageText = "internal temperature seems very high";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }
    //Feed level
    if (message["5"] > 50) {
      // feeder tank
      messageTopic = "feederlevel";
      messageText = "feed level is low";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }
    //
    //Battery Status
    if (message["8"] <= 11.5) {
      // battery low
      messageTopic = "battery";
      messageText = "battery level is low";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }
    //
    //Battery Charging
    if (message["10"] < 0) {
      // charging
      messageTopic = "batterycharging";
      messageText = "battery is charging";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    } else if (message["10"] > 0) {
      // charging stopped
      messageTopic = "batterycharging";
      messageText = "battery stopped charging";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }

    //
    //Battery Motor
    if (message["13"] > 0) {
      // motor
      messageTopic = "motor";
      messageText = "motor current stopped";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    } else if (message["13"] < 0) {
      // motor
      messageTopic = "motor";
      messageText = "motor current started";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }
  }

  //Sensor Working
  if (topic == "sensorworking") {
    if (message["Motor"] == "N") {
      messageTopic = "motorworking";
      messageText = "motor not working";

      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }
    if (message["Ping"] == "N") {
      messageTopic = "feederlevelworking";
      messageText = "ping sensor not working";
      payload = {
        message_topic: messageTopic,
        message_text: messageText,
        feeder_id: feeder_id,
      };
      await models.NotificationAlerts.create(payload);
    }
  }

  //Feeding Done
  if (topic == "feedingdone") {
    messageTopic = "feedingdone";
    var dateString = moment
      .unix(message["65"])
      .format("dddd, MMMM D, YYYY, H:mm:ss");
    messageText = "feeding done at " + dateString;
    payload = {
      message_topic: messageTopic,
      message_text: messageText,
      feeder_id: feeder_id,
    };
    await models.NotificationAlerts.create(payload);
  }
};

const getAllNotificationsList = async (req, res) => {
  // const query = "select FeedingDevices.id,FeedingDevices.title, NotificationAlerts.feeder_id, " +
  //     "NotificationAlerts.message_topic, NotificationAlerts.message_text, NotificationAlerts.createdAt " +
  //     "from NotificationAlerts " +
  //     "inner join FeedingDevices on FeedingDevices.id=NotificationAlerts.feeder_id " +
  //     "where NotificationAlerts.id in ( " +
  //     "select max(id) as id from NotificationAlerts where message_topic!='' " +
  //     "group by feeder_id, message_topic order by id desc " +
  //     ") order by NotificationAlerts.id desc limit 30";

  var loggedInUserId = req.session?.user?.id;
  if (!loggedInUserId) {
    loggedInUserId = "";
  } else {
    loggedInUserId = `AND UserDevices.user_id = ${loggedInUserId}`;
  }
  const query = `SELECT 
                    FeedingDevices.id,
                    FeedingDevices.title, 
                    NotificationAlerts.feeder_id, 
                    NotificationAlerts.message_topic, 
                    NotificationAlerts.message_text, 
                    NotificationAlerts.createdAt 
                FROM 
                    NotificationAlerts 
                INNER JOIN 
                    FeedingDevices ON FeedingDevices.id = NotificationAlerts.feeder_id 
                INNER JOIN
                    UserDevices ON UserDevices.feeder_id = FeedingDevices.id
                WHERE 
                    NotificationAlerts.id IN (
                        SELECT 
                            MAX(id) AS id 
                        FROM 
                            NotificationAlerts 
                        WHERE 
                            message_topic != '' 
                        GROUP BY 
                            feeder_id, message_topic 
                        ORDER BY 
                            id DESC
                    )
                    ${loggedInUserId} 
                ORDER BY 
                    NotificationAlerts.id DESC 
                LIMIT 
                    30`;
  const records = await models.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });
  res.status(200).json(records);
};
/*
62= vibration x,y,z
63=resultantG
64=peakresultant G
 
 
If any of these values are not responding properly, then a notification must be triggered 
 
Heartbeat
If coming continuesly, then system is ok, otherwise if missing, then their is some complications
If 5 consecutively heartbeats are not coming, then show notifications
if starts from zero, then restarted and show the restart times
 
time is unix to convert to local
feeddone comes when motor finishes the feed
 
Superadmin to create birdfeeders and then other users to monitor and send commands
 
 
//
5 min interval - feedsetting
68 = mins for next feed
//
 
// */

String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substring(0, index) +
    replacement +
    this.substring(index + replacement.length)
  );
};

const publishMessage = (topic, message) => {
  console.log("MQTT Message Arrived.", topic, message);
  PublishCommand(topic, message);
};
const getServerData = async (req, res) => {
  let topic = req.body.topic;
  let message = req.body.message;

  if (topic != "") {
    console.log("MQTT Message Arrived.", topic, message);

    let splited_topic = splitStr(topic, "/");
    var topic_length = Object.keys(splited_topic).length;
    var getLastElem = splited_topic[topic_length - 1];

    if (topic_length == 4) {
      getLastElem =
        splited_topic[topic_length - 2] + "" + splited_topic[topic_length - 1];
    }

    let post = { message: message, topic: getLastElem };
    models.ServerMessages.create(post).catch((error) => {
      if (error) {
        console.log("error in creation commands" + error);
      }
    });

    PublishCommand(topic, message);
    console.log("\nPublished message\n");
  }
  let servercommands = await models.ServerMessages.findAll({
    order: [["id", "DESC"]],
    limit: 10,
  });
  if (servercommands !== null) {
    res.status(200).json(servercommands);
  } else {
    res.status(200).json({ success: false });
  }
};
const addHeartBeat = (req, res) => {
  console.log("hb call arrived: " + req.body.newhb);
};
const getVoltCurrentData = async (req, res) => {
  let feeder_id = req.params.feederId;
  let clientcommands = await models.SensorStatus.findAll({
    where: {
      feeder_id: feeder_id,
    },
    order: [["id", "DESC"]],
    limit: 10,
  });
  var newAr = {};
  let myBtyVoltAr = [];
  let myBtyCurAr = [];
  let mySlrVoltAr = [];
  let mySlrCurAr = [];
  let myTankLevel = [];

  if (clientcommands !== null) {
    let i = 1;
    clientcommands.map((elem) => {
      let message = JSON.parse(elem.client_message);
      // console.log(message);

      if (i < 6) {
        myTankLevel.push(message["5"]);
      }
      i++;
      let btyVolt = message["8"];
      let slrVolt = message["9"];
      let btyCur = message["10"];
      let slrCur = message["12"];

      myBtyVoltAr.push(btyVolt);
      mySlrVoltAr.push(slrVolt);
      myBtyCurAr.push(btyCur);
      mySlrCurAr.push(slrCur);
    });
    newAr["btyVolt"] = myBtyVoltAr;
    newAr["btyCur"] = myBtyCurAr;
    newAr["slrVolt"] = mySlrVoltAr;
    newAr["slrCur"] = mySlrCurAr;
    newAr["tankLevel"] = myTankLevel;
    res.status(200).json(newAr);
  } else {
    res.status(200).json({ success: false });
  }
};
const getAlarmNotificationsData = async (req, res) => {
  let clientcommands = await models.ClientMessages.findAll({
    where: {
      client_topic: {
        [Op.like]: "alarm%",
      },
    },
    order: [["id", "DESC"]],
    limit: 10,
  });

  if (clientcommands !== null) {
    res.status(200).json(clientcommands);
  } else {
    res.status(200).json({ success: false });
  }
};
const getSensorData = async (req, res) => {
  let feeder_id = req.params.feederId;
  console.log(req.params.feederId);
  let clientcommands = await models.SensorStatus.findOne({
    where: {
      feeder_id: feeder_id,
    },
    order: [["id", "DESC"]],
    limit: 1,
  });

  if (clientcommands !== null) {
    const response = {
      status: true,
      data: clientcommands,
    };
    res.status(200).json(response);
  } else {
    res.status(200).json({ success: false });
  }
};
module.exports = {
  getSensorData,
  getServerData,
  getVoltCurrentData,
  getAlarmNotificationsData,
  getAllNotificationsList,
};
