const moment = require("moment");
const models = require("../models");
const { client, PublishCommand } = require("../mqtt");
const { exit } = require("process");

const handleQuantity = (time, qty) => {
  let div = qty / 2;
  console.log(time);
  for (let i = 1; i < div; i++) {
    let newHM = moment("2024-02-24 " + time)
      .add(2, "minutes")
      .format("H:mm");
    time = newHM;
    console.log(newHM);
  }
};
const collectSchedules = async (feeder_id, curday = "today") => {
  let moment_date;
  let dayName;
  if (curday == "today") {
    // const wdata = await getWeatherData("dubai")
    // let moment_date = moment().utcOffset(240).format("YYYY-MM-DD");
    moment_date = moment().utcOffset(240).format("YYYY-MM-DD");
    // let dayName = moment().zone("+0400").format("ddd")
    // let dayName = moment().utcOffset(240).format("ddd");
    dayName = moment().utcOffset(240).format("ddd");
  } else {
    // const wdata = await getWeatherData("dubai")
    // let moment_date = moment().utcOffset(240).format("YYYY-MM-DD");
    moment_date = moment().add(1, "day").utcOffset(240).format("YYYY-MM-DD");
    // let dayName = moment().zone("+0400").format("ddd")
    // let dayName = moment().utcOffset(240).format("ddd");
    dayName = moment().add(1, "day").utcOffset(240).format("ddd");
  }
  console.log("Today date: ", moment_date);
  console.log("Today date: ", dayName);

  let whereCond = {
    is_enabled: 1,
    feeder_id: feeder_id,
  };

  let SunriseSunset = await models.SunriseSunset.findOne({
    where: models.sequelize.where(
      models.sequelize.fn("date", models.sequelize.col("sp_date")),
      "=",
      moment_date
    ),
  });
  // console.log("Today date: ", SunriseSunset)
  // process.exit(0)

  if (SunriseSunset) {
    let sunrise = SunriseSunset.sunrise;
    let sunset = SunriseSunset.sunset;
    console.log("DayName", sunrise, sunset);

    let feedJobs = await models.FoodSchedules.findAll({
      include: [{ model: models.FeedingDevices }],
      where: whereCond,
    });
    if (feedJobs !== null) {
      var dateString_Sunrise = moment(moment_date + " " + sunrise);
      var dateString_Sunset = moment(moment_date + " " + sunset);

      // console.log("feederId", feederId)
      console.log("sunrise", sunrise);
      console.log("sunset", sunset);
      console.log("Ssunrise", dateString_Sunrise);
      console.log("Ssunset", dateString_Sunset);

      let FeederTimings = [];
      let Feeders = [];
      feedJobs.map((val) => {
        let feederId = val.FeedingDevice.feeder_id;
        if (Feeders.includes(feederId) == false) {
          Feeders[val.FeedingDevice.id] = feederId;
          FeederTimings[val.FeedingDevice.id] = [];
        }
        let feed_schedule = val.feed_schedule;
        let feed_time_type = val.feed_time_type;
        let feed_time = val.feed_time;
        let feedDays = JSON.parse(val.feed_day);
        console.log("feedschedule", dayName, feedDays);

        let StrTimings = [];
        if (feedDays.includes(dayName)) {
          console.log("feedschedule", feed_schedule);

          if (feed_schedule == "FixedTime") {
            let feedtimesplited = feed_time.split(",");

            feedtimesplited.map((val) => {
              StrTimings.push(val);
            });
            // if (feed_time != "null" && feed_time !== null) {
            //     if (feed_time.indexOf(",") >= 0) {
            //         let feedtimesplited = feed_time.split(",");
            //         feedtimesplited.map((val) => {
            //             StrTimings.push(val);
            //         })
            //     } else {
            //         StrTimings.push(feed_time);
            //     }
            // }

            // StrTimings.push(feed_time);
          } else if (feed_schedule == "Sunrise") {
            console.log("sunrise in");
            if (feed_time_type == "before") {
              console.log("sunrise before");
              var sunriseTimeToFeed = moment(dateString_Sunrise)
                .subtract(feed_time, "minutes")
                .format("H:mm");
              let sunriseAr = sunriseTimeToFeed.split(":");
              if (sunriseAr[0] < 10) {
                StrTimings.push("0" + sunriseTimeToFeed);
              } else {
                StrTimings.push(sunriseTimeToFeed);
              }
            } else {
              console.log("sunrise after");
              var sunriseTimeToFeed = moment(dateString_Sunrise)
                .add(feed_time, "minutes")
                .format("H:mm");
              let sunriseAr = sunriseTimeToFeed.split(":");
              if (sunriseAr[0] < 10) {
                StrTimings.push("0" + sunriseTimeToFeed);
              } else {
                StrTimings.push(sunriseTimeToFeed);
              }
            }
          } else if (feed_schedule == "Sunset") {
            if (feed_time_type == "before") {
              var sunsetTimeToFeed = moment(dateString_Sunset)
                .subtract(feed_time, "minutes")
                .format("H:mm");
              StrTimings.push(sunsetTimeToFeed);
            } else {
              var sunsetTimeToFeed = moment(dateString_Sunset)
                .add(feed_time, "minutes")
                .format("H:mm");
              StrTimings.push(sunsetTimeToFeed);
            }
          }
          if (FeederTimings.includes(val.FeedingDevice.id) == false) {
            // Feeders[val.FeedingDevice.id] = feederId
            // FeederTimings[val.FeedingDevice.id] = []
          }
          FeederTimings[val.FeedingDevice.id].push(StrTimings);
        } else {
          console.log("Feeders", Feeders);
          console.log("FeederTimings", FeederTimings);
        }
      });
      console.log("Feeders", Feeders);
      console.log("FeederTimings", FeederTimings);
      if (FeederTimings[feeder_id]?.length > 0) {
        let myNewAr = [];
        for (let i = 0; i < FeederTimings[feeder_id].length; i++) {
          FeederTimings[feeder_id][i].map((val, j) => {
            // console.log("Feeders", FeederTimings[feeder_id][i]);
            let ArVal = FeederTimings[feeder_id][i][j];
            ArVal = ArVal.split(":");
            console.log("Feeders", ArVal);
            let NextPossible = ArVal[0] + "" + ArVal[1];
            myNewAr.push(NextPossible);
          });
        }
        myNewAr.sort();

        // exit(0)

        myNewAr.map((timeframe, i) => {
          var output = [timeframe.slice(0, 2), ":", timeframe.slice(2)].join(
            ""
          );
          myNewAr[i] = moment_date + " " + output + ":00";
        });

        var CurrentdateString = moment()
          .zone("+0400")
          .format("dddd, MMMM D, YYYY, H:mm:ss");
        let mostlasttime = myNewAr[myNewAr.length - 1];
        var nextSchedule = moment(mostlasttime).format(
          "dddd, MMMM D, YYYY, H:mm:ss"
        );
        if (moment(nextSchedule).isAfter(CurrentdateString)) {
          return myNewAr;
        } else {
          return await collectSchedules(feeder_id, "tomorrow");
        }

        // return myNewAr
      } else {
        return false;
      }
    } else {
      // If no schedule on this day
      return false;
    }
  } else {
    // No sunset and sunrise
    return false;
  }
};

const ExecuteFeedingCommands = async (feeder_id = null, userId = null) => {
  // const wdata = await getWeatherData("dubai")
  // let moment_date = moment().utcOffset(240).format("YYYY-MM-DD");
  let moment_date = moment().format("YYYY-MM-DD");
  // let dayName = moment().zone("+0400").format("ddd")
  // let dayName = moment().utcOffset(240).format("ddd");
  let dayName = moment().format("ddd");
  console.log("Today date: ", moment_date);
  console.log("Today date: ", dayName);

  let whereCond = {
    is_enabled: 1,
  };
  if (feeder_id && userId) {
    whereCond = {
      is_enabled: 1,
      feeder_id: feeder_id,
    };
  }

  let SunriseSunset = await models.SunriseSunset.findOne({
    where: models.sequelize.where(
      models.sequelize.fn("date", models.sequelize.col("sp_date")),
      "=",
      moment_date
    ),
  });
  // console.log("Today date: ", SunriseSunset)
  // process.exit(0)

  if (SunriseSunset) {
    let sunrise = SunriseSunset.sunrise;
    let sunset = SunriseSunset.sunset;
    console.log("DayName", sunrise, sunset);

    let feedJobs = await models.FoodSchedules.findAll({
      include: [{ model: models.FeedingDevices }],
      where: whereCond,
    });
    if (feedJobs !== null) {
      var dateString_Sunrise = moment(moment_date + " " + sunrise);
      var dateString_Sunset = moment(moment_date + " " + sunset);

      // console.log("feederId", feederId)
      console.log("sunrise", sunrise);
      console.log("sunset", sunset);
      console.log("Ssunrise", dateString_Sunrise);
      console.log("Ssunset", dateString_Sunset);

      let FeederTimings = [];
      let Feeders = [];
      feedJobs.map((val) => {
        let feederId = val.FeedingDevice.feeder_id;
        if (Feeders.includes(feederId) == false) {
          Feeders[val.FeedingDevice.id] = feederId;
          FeederTimings[val.FeedingDevice.id] = [];
        }
        let feed_schedule = val.feed_schedule;
        let feed_time_type = val.feed_time_type;
        let feed_time = val.feed_time;
        let feedDays = JSON.parse(val.feed_day);

        let StrTimings = [];
        if (feedDays.includes(dayName)) {
          console.log("feedschedule", feed_schedule);
          console.log("feedschedule", feed_time);

          if (feed_schedule == "FixedTime") {
            if (feed_time != "null" && feed_time !== null) {
              if (feed_time.indexOf(",") >= 0) {
                let feedtimesplited = feed_time.split(",");
                feedtimesplited.map((val) => {
                  StrTimings.push(val);
                });
              } else {
                StrTimings.push(feed_time);
              }
            }
            // let feedtimesplited = feed_time.split(",");

            // feedtimesplited.map((val) => {
            //     StrTimings.push(val);
            // })
            // StrTimings.push(feed_time);
          } else if (feed_schedule == "Sunrise") {
            console.log("sunrise in");
            if (feed_time_type == "before") {
              console.log("sunrise before");
              var sunriseTimeToFeed = moment(dateString_Sunrise)
                .subtract(feed_time, "minutes")
                .format("H:mm");
              let sunriseAr = sunriseTimeToFeed.split(":");
              if (sunriseAr[0] < 10) {
                StrTimings.push("0" + sunriseTimeToFeed);
              } else {
                StrTimings.push(sunriseTimeToFeed);
              }
            } else {
              console.log("sunrise after");
              var sunriseTimeToFeed = moment(dateString_Sunrise)
                .add(feed_time, "minutes")
                .format("H:mm");
              let sunriseAr = sunriseTimeToFeed.split(":");
              if (sunriseAr[0] < 10) {
                StrTimings.push("0" + sunriseTimeToFeed);
              } else {
                StrTimings.push(sunriseTimeToFeed);
              }
            }
          } else if (feed_schedule == "Sunset") {
            if (feed_time_type == "before") {
              var sunsetTimeToFeed = moment(dateString_Sunset)
                .subtract(feed_time, "minutes")
                .format("H:mm");
              StrTimings.push(sunsetTimeToFeed);
            } else {
              var sunsetTimeToFeed = moment(dateString_Sunset)
                .add(feed_time, "minutes")
                .format("H:mm");
              StrTimings.push(sunsetTimeToFeed);
            }
          }
          if (FeederTimings.includes(val.FeedingDevice.id) == false) {
            // Feeders[val.FeedingDevice.id] = feederId
            // FeederTimings[val.FeedingDevice.id] = []
          }
          FeederTimings[val.FeedingDevice.id].push(StrTimings);
        }
      });

      console.log("Feeders", Feeders);
      console.log("FeederTimings", FeederTimings);

      if (Feeders.length > 0) {
        console.log("Automatic generated Commands\n");
        console.log("Day is : ", dayName);
        console.log("\n");
        await Promise.all(
          Feeders.map(async (feederId, i) => {
            if (i > 0) {
              if (
                FeederTimings &&
                FeederTimings[i] &&
                FeederTimings[i].length > 0
              ) {
                let topic = "ctrl/feedsetting";
                if (process.env.DEV_ENV === "development") {
                  await HandleStopService(i, feederId, false);
                }
                let AllTimings = FeederTimings[i].join();
                console.log("Final Timings: ", feederId, AllTimings);
                let message =
                  "0<ctrl_feed_timings>0," +
                  "1<" +
                  feederId +
                  ">1," +
                  "81<" +
                  AllTimings +
                  ">81";

                console.log("command ", i);
                console.log(message);
                // console.log("\n")
                PublishCommand(topic, message);
                AuditInsertion = { command: message };
                if (feeder_id && userId) {
                  AuditInsertion = { command: message, user_id: userId };
                }
                await models.AuditLogs.create(AuditInsertion);
              } else {
                if (process.env.DEV_ENV === "development") {
                  await HandleStopService(i, feederId, true);
                }
              }
            } else {
              console.log("command", FeederTimings);
            }
          })
        );
      }
    } else {
      console.log("scheduleData is null");
    }
  }
};

let HandleStopService = async (intFeederId, feederId, ToStop) => {
  let FeedRunStatus = await models.FeedRunStatus.findOne({
    where: {
      feeder_id: intFeederId,
    },
  });
  let toStop = ToStop ? 0 : 1;
  if (FeedRunStatus !== null) {
    await models.FeedRunStatus.update(
      { status: toStop },
      {
        where: {
          feeder_id: intFeederId,
        },
      }
    );
  } else {
    await models.FeedRunStatus.create({
      feeder_id: intFeederId,
      status: toStop,
    });
  }

  let topic = "ctrl/feedsetting";
  let message;
  if (ToStop) {
    message = "0<ctrl_feed_stop_on>0,1<" + feederId + ">1";
  } else {
    message = "0<ctrl_feed_stop_off>0,1<" + feederId + ">1";
  }
  console.log("command");
  console.log(message);
  console.log("\n");
  PublishCommand(topic, message);
  let AuditInsertion = { command: message };
  await models.AuditLogs.create(AuditInsertion);
};

module.exports = { ExecuteFeedingCommands, collectSchedules };
