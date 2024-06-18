var mqtt = require("mqtt");
const { exit } = require("process");

// var options = {
//     host: 'gaztec.ddns.net',
//     port: 1883,
//     protocol: 'mqtt',
//     username: 'BF_1',
//     password: '123456'
// }

// console.log(process.env.MQTT_HOST, process.env.MQTT_PORT, process.env.MQTT_PROTOCOL, process.env.MQTT_USERNAME, process.env.MQTT_PASSWORD);
// exit;
var options = {
  host: process.env.MQTT_HOST,
  port: process.env.MQTT_PORT,
  protocol: process.env.MQTT_PROTOCOL,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};
var client = mqtt.connect(options);
client.on("connect", function () {
  console.log("MQTT", "Connected");
});
client.on("error", function (error) {
  console.log(error);
  process.exit;
});

const PublishCommand = (topic, message) => {
  if (process.env.DEV_ENV === "development") {
    client.publish(topic, message);
  } else {
    console.log("Command on Dev: ", topic, message);
    // console.log("Exit on publish due to: ", process.env.DEV_ENV)
    // process.exit(0)
  }
};

const subscribeTopics = (client_id = 0) => {
  console.log("client_id", client_id);
  // const important_topics = [
  //     'ctrl/feedsetting',
  //     'ctrl/testsettings',
  //     'ctrl/jerk',
  //     'ctrl/query',
  //     'BF/ctrl/HB',
  //     'BF/#',
  //     'BF/Video/capture',
  //     'BF/Video/capture1',
  //     'BF/Video/capture2',
  //     'BF/Video/Processed2',
  //     'BF/Video/Processed1',
  //     'BF/' + client_id + '/response',
  //     'BF/' + client_id + '/feedingdone',
  //     'BF/' + client_id + '/sensor/status',
  //     'BF/' + client_id + '/sensor/onse',
  //     'BF/' + client_id + '/alarm',
  //     'BF/' + client_id + '/error',
  //     'BF/' + client_id + '/sensor/working',
  //     'BF/' + client_id + '/time/status',
  //     'BF/' + client_id + '/alarm/viberation',
  //     'BF/' + client_id + '/alarm/tilt',
  //     'BF/' + client_id + '/alarm/motor',
  //     'BF/' + client_id + '/network',
  //     'BF/' + client_id + '/HB'

  // ];
  const important_topics = ["ctrl/#", "BF/#"];
  client.subscribe(important_topics);
  console.log("MQTT", "Topics Subscribed");
};

module.exports = { subscribeTopics, client, PublishCommand };
