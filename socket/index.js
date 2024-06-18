const models = require("../models");
// const io = require('socket.io')(process.env.SOCKET_PORT, {
//     cors: {
//         origin: true,
//         optionsSuccessStatus: 200,
//         credentials: true,
//     },
//     maxHttpBufferSize: 1e8
// })

const io = require("socket.io")(process.env.SOCKET_PORT, {
  cors: { origin: [process.env.FRONTEND_URL, "http://localhost:3000"] },
  maxHttpBufferSize: 1e8,
});

io.setMaxListeners(0);
const postSocketMessage = (topic, message, feeder_id) => {
  if (!Object.keys(message || {}).length) return;

  io.emit("custom-event", topic, message, feeder_id);
  console.log("socket message: ", topic);
};
const postSocketNotification = (notifications) => {
  io.emit("notification", notifications);
  console.log("socket notification");
};

const splitStr = (str, separator) => {
  // Function to split string
  let string = str.split(separator);
  return string;
};

io.on("connection", (socket) => {
  console.log("Socket Connected. ID: " + socket.id);
  socket.on("custom-event", (topic, message) => {
    console.log("received socket message: ", topic, message);
    var client_topic = topic;
    // var client_message = message.toString()

    //publishMessage(topic, message);

    // Code to modify topic

    let splited_topic = splitStr(client_topic, "/");
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
  });
});
module.exports = { io, splitStr, postSocketMessage, postSocketNotification };
