require("dotenv").config();
const https = require("https");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const tls = require("tls");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const db = require("./models");
const mqtt_routes = require("./routes/mqttroutes.js");
const { runCrons } = require("./cron");
const path = require("path");
const app = express();
const process = require("process");
const secret = process.env.SESSION_SECRET || "dxb123";
//const sessionMiddleware = require('./middleware/sessionMiddleware'); // Adjust the path as needed
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_D,
      process.env.FRONTEND_URL_DS,
      process.env.FRONTEND_URL_I,
      process.env.FRONTEND_URL_IS,
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

var cookieParser = require("cookie-parser");

app.use(cookieParser());
// Configure session
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: new SequelizeStore({
      db: db.sequelize,
      tableName: "Session",
    }),

    cookie: {
      maxAge: 12 * 60 * 60 * 1000, // 12 hours  of inactivity user be pushed to login
    },
  })
);

//app.use(sessionMiddleware);

app.use(mqtt_routes);
app.use(express.static("public"));
app.use(express.static("uploads"));

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
runCrons();
// const key = fs.readFileSync('./public/server.key');
// const cert = fs.readFileSync('./public/server.cert');

// const secureContext = tls.createSecureContext({ key, cert, passphrase: 'your_passphrase_here' });
// const server = https.createServer({ secureContext }, app);
db.sequelize.sync().then((req) => {
  // server.listen(process.env.SERVER_PORT, "https://mngar.ae", () => {
  //     console.log("Server is running on port: " + process.env.SERVER_PORT)

  // })
  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server is running on port: " + process.env.SERVER_PORT);
  });
});
