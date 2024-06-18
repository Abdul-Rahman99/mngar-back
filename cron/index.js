const models = require('../models');
const { DataTypes, Op, QueryTypes } = require('sequelize');
var moment = require("moment");
const { ExecuteFeedingCommands } = require("../Helper")
var { io, postSocketNotification } = require("../socket");
const cron = require('node-cron');
const getFormatted = (str) => {
    // let newDate = str.getFullYear() + "-" + (str.getMonth() + 1) + "-" + str.getDate() + " " + str.getHours() + ":" + str.getMinutes() + ":" + str.getSeconds();
    let newDate = str.getFullYear() + "-" + (str.getMonth() + 1) + "-" + str.getDate();
    return newDate;
}

const purgeOldCameraData = async () => {
    let date_now = new Date();
    let yesterday = moment(date_now).subtract("1", "days").format("YYYY-MM-DD");

    console.log("purge command before: ", sdatefrom)
    try {
        await models.CameraData.destroy({
            where: {
                createdAt: {
                    [Op.lt]: yesterday,
                },
            },
        });
        console.log("purge command executed")
    } catch (error) {
        console.log("purge command not executed")
        console.log(error)
    }
}
const NotificationCommand = async () => {
    console.log("notification command executed")
    // const query = "select FeedingDevices.title, NotificationAlerts.feeder_id, NotificationAlerts.message_topic, NotificationAlerts.message_text, NotificationAlerts.createdAt " +
    //     "from NotificationAlerts " +
    //     "inner join FeedingDevices on FeedingDevices.feeder_id=NotificationAlerts.feeder_id " +
    //     "where message_topic!='' and NotificationAlerts.id in ( " +
    //     "select max(id) as id from NotificationAlerts " +
    //     "group by feeder_id, message_topic, createdAt order by id desc" +
    //     ") order by NotificationAlerts.id desc limit 30";
    const query = "select FeedingDevices.title, NotificationAlerts.feeder_id, NotificationAlerts.message_topic, NotificationAlerts.message_text, NotificationAlerts.createdAt " +
        "from NotificationAlerts " +
        "inner join FeedingDevices on FeedingDevices.id=NotificationAlerts.feeder_id " +
        "where message_topic!='' " +
        "group by feeder_id, message_topic, createdAt " +
        "order by NotificationAlerts.id desc limit 12";
    const records = await models.sequelize.query(query, {
        type: QueryTypes.SELECT
    });
    postSocketNotification(records)
}
const SystemCheck = async () => {
    let messageTopic = "system"
    let messageText = "";

    //Check Server
    let systemData = await models.ClientMessages.findOne({
        order: [
            ['id', 'DESC']
        ],
        limit: 1
    })
    let now = new Date();
    if (systemData != null) {
        let lastSysArrival = systemData.createdAt;
        var duration = moment.duration(moment(now).diff(moment(lastSysArrival)))
        var hours = Math.round(duration.asHours())
        let hours_text;
        if (hours > 24) {
            let days = Math.round((hours / 24));

            hours_text = days + (days <= 1 ? "day" : " days");
        } else {
            if (hours <= 1)
                hours_text = hours + " hour";
            else
                hours_text = hours + " hours";
        }

        if (hours >= 2) {
            messageText = "MQTT Server looks like offline / not responding since " + hours_text;
            postSocketNotification([{ 'title': 'All Feeders', 'message_topic': messageTopic, 'message_text': messageText, 'createdAt': moment(now).format("dddd, MMMM D, YYYY, H:mm:ss"), 'feeder_id': "All Feeders" }])
        } else {
            NotificationCommand()
        }
    } else {
        messageText = "MQTT Server looks like offline / not responding since long";
        postSocketNotification([{ 'title': 'All Feeders', 'message_topic': messageTopic, 'message_text': messageText, 'createdAt': moment(now).format("dddd, MMMM D, YYYY, H:mm:ss"), 'feeder_id': "All Feeders" }])
    }
}
const FeedScheduler____ = async () => {

    // const wdata = await getWeatherData("dubai")
    let moment_date = moment().utcOffset(240).format("YYYY-MM-DD");
    // let dayName = moment().zone("+0400").format("ddd")
    let dayName = moment().utcOffset(240).format("ddd");
    console.log("Today date: ", moment_date)
    console.log("Today date: ", dayName)

    let SunriseSunset = await models.SunriseSunset.findOne({
        where: models.sequelize.where(models.sequelize.fn('date', models.sequelize.col('sp_date')), '=', moment_date)
    });
    // console.log("Today date: ", SunriseSunset)
    // process.exit(0)

    if (SunriseSunset) {
        let sunrise = SunriseSunset.sunrise;
        let sunset = SunriseSunset.sunset;
        console.log("DayName", sunrise, sunset);

        let feedJobs = await models.FoodSchedules.findAll({
            include: [
                { model: models.FeedingDevices }
            ],
            where: {
                is_enabled: 1
            }
        });
        if (feedJobs !== null) {

            var dateString_Sunrise = moment(moment_date + " " + sunrise);
            var dateString_Sunset = moment(moment_date + " " + sunset);

            // console.log("feederId", feederId)
            console.log("sunrise", sunrise)
            console.log("sunset", sunset)
            console.log("Ssunrise", dateString_Sunrise)
            console.log("Ssunset", dateString_Sunset)

            let FeederTimings = [];
            let Feeders = [];
            feedJobs.map((val) => {


                let feederId = val.FeedingDevice.feeder_id;

                let feed_schedule = val.feed_schedule;
                let feed_time_type = val.feed_time_type;
                let feed_time = val.feed_time;
                let feedDays = JSON.parse(val.feed_day);



                let StrTimings = [];
                if (feedDays.includes(dayName)) {


                    console.log("feedschedule", feed_schedule)

                    if (feed_schedule == "FixedTime") {

                        let feedtimesplited = feed_time.split(",");

                        feedtimesplited.map((val) => {
                            StrTimings.push(val);
                        })
                        // StrTimings.push(feed_time);
                    } else if (feed_schedule == "Sunrise") {
                        console.log("sunrise in")
                        if (feed_time_type == "before") {
                            console.log("sunrise before")
                            var sunriseTimeToFeed = moment(dateString_Sunrise).subtract(feed_time, 'minutes').format("H:mm");
                            let sunriseAr = sunriseTimeToFeed.split(":");
                            if (sunriseAr[0] < 10) {
                                StrTimings.push("0" + sunriseTimeToFeed);
                            } else {
                                StrTimings.push(sunriseTimeToFeed);
                            }

                        } else {
                            console.log("sunrise after")
                            var sunriseTimeToFeed = moment(dateString_Sunrise).add(feed_time, 'minutes').format("H:mm");
                            let sunriseAr = sunriseTimeToFeed.split(":");
                            if (sunriseAr[0] < 10) {
                                StrTimings.push("0" + sunriseTimeToFeed);
                            } else {
                                StrTimings.push(sunriseTimeToFeed);
                            }
                        }

                    } else if (feed_schedule == "Sunset") {
                        if (feed_time_type == "before") {
                            var sunsetTimeToFeed = moment(dateString_Sunset).subtract(feed_time, 'minutes').format("H:mm");
                            StrTimings.push(sunsetTimeToFeed);
                        } else {
                            var sunsetTimeToFeed = moment(dateString_Sunset).add(feed_time, 'minutes').format("H:mm");
                            StrTimings.push(sunsetTimeToFeed);
                        }

                    }
                    if (Feeders.includes(feederId) == false) {
                        Feeders[val.FeedingDevice.id] = feederId
                        FeederTimings[val.FeedingDevice.id] = []
                    }
                    FeederTimings[val.FeedingDevice.id].push(StrTimings)
                }





            })

            // console.log("Feeders", Feeders);
            // console.log("FeederTimings", FeederTimings);
            if (FeederTimings.length > 0) {
                console.log("Automatic generated Commands\n");
                await Promise.all(
                    FeederTimings.map(async (val, i) => {
                        if (i > 0) {
                            let feederId = Feeders[i]
                            let AllTimings = val.join();
                            // console.log("Final Timings: ", feederId, AllTimings);
                            let topic = "ctrl/feedsetting";
                            let message = "0<ctrl_feed_timings>0," +
                                "1<" + feederId + ">1," +
                                "81<" + AllTimings + ">81";
                            console.log("\n")
                            console.log("command ", i)
                            console.log(message)
                            console.log("\n")
                            PublishCommand(topic, message)
                            // await models.AuditLogs.create({ command: message })
                        } else {
                            console.log("command", FeederTimings)
                        }
                    })
                )
            }
        } else {
            console.log("scheduleData is null");
        }
    }

    console.log("DayName", dayName);
    // process.exit(0)
}
/*
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )
*/
const runPurgeCommand = () => {
    // run daily at 12 noon to purge old camera data
    // cron.schedule("0 22 * * *", purgeOldCameraData);
}
const runNotificationCommand = () => {
    // run daily at 12 noon to purge old camera data
    cron.schedule("*/10 * * * *", NotificationCommand);
    cron.schedule("0 2 * * *", ExecuteFeedingCommands, {
        scheduled: true,
        timezone: "Asia/Dubai"
    });
    ExecuteFeedingCommands()
}
const runSystemCheckCommand = () => {
    // run daily at 12 noon to purge old camera data
    // cron.schedule("*/5 * * * * *", SystemCheck);
}
const runCrons = () => {
    console.log("Crons are scheduled")
    runPurgeCommand()
    runNotificationCommand()
    runSystemCheckCommand()
}
module.exports = {
    runCrons
}