// const fetch = import("node-fetch");
const fetch = require("node-fetch");
// Function to fetch weather data
async function getWeatherData(city) {
    const apiKey = "e0e1705375a62298c79d713a320acb4b";
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${apiKey}`;
    try {
        const response = await fetch(weatherURL);
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        console.log("Error fetching weather data:", error);
        return false;
    }
}

module.exports = { getWeatherData }