const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");

const weatherContent = document.getElementById("weatherContent");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const themeButton = document.getElementById("themeButton");


/* =========================================
   WEATHER DESCRIPTION
========================================= */

function getWeatherDescription(code) {

    const weather = {
        0: ["Clear Sky", "☀️"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Fog", "🌫️"],
        48: ["Fog", "🌫️"],
        51: ["Light Drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy Drizzle", "🌧️"],
        56: ["Freezing Drizzle", "🌧️"],
        57: ["Freezing Drizzle", "🌧️"],
        61: ["Light Rain", "🌦️"],
        63: ["Rain", "🌧️"],
        65: ["Heavy Rain", "🌧️"],
        66: ["Freezing Rain", "🌧️"],
        67: ["Freezing Rain", "🌧️"],
        71: ["Light Snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy Snow", "❄️"],
        77: ["Snow Grains", "❄️"],
        80: ["Rain Showers", "🌦️"],
        81: ["Rain Showers", "🌧️"],
        82: ["Heavy Rain Showers", "⛈️"],
        85: ["Snow Showers", "🌨️"],
        86: ["Heavy Snow Showers", "❄️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with Hail", "⛈️"],
        99: ["Thunderstorm with Hail", "⛈️"]
    };

    return weather[code] || ["Unknown", "🌤️"];
}


/* =========================================
   SEARCH BUTTON
========================================= */

searchButton.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        return;
    }

    loadWeather(city);
});


/* =========================================
   ENTER KEY
========================================= */

cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        const city = cityInput.value.trim();

        if (city !== "") {

            loadWeather(city);

        }

    }

});


/* =========================================
   LOAD WEATHER
========================================= */

async function loadWeather(city) {

    hideError();

    loading.style.display = "block";
    weatherContent.style.display = "none";

    try {

        const response = await fetch(
            `/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.error || "Unable to get weather."
            );

        }

        displayWeather(data);

    }

    catch (error) {

        console.error("Weather Error:", error);

        showError(error.message);

    }

    finally {

        loading.style.display = "none";

    }

}


/* =========================================
   DISPLAY WEATHER
========================================= */

function displayWeather(data) {

    weatherContent.style.display = "block";


    /* Location */

    document.getElementById("cityName").textContent =
        data.location.city;

    document.getElementById("countryName").textContent =
        data.location.country;


    /* Current weather */

    const current = data.current;

    const [description, icon] =
        getWeatherDescription(
            current.weather_code
        );


    document.getElementById("temperature").textContent =
        Math.round(current.temperature_2m);


    document.getElementById("weatherIcon").textContent =
        icon;


    document.getElementById("weatherDescription").textContent =
        description;


    document.getElementById("feelsLike").textContent =
        Math.round(current.apparent_temperature) + "°";


    /* Details */

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m + "%";


    document.getElementById("wind").textContent =
        Math.round(current.wind_speed_10m) + " km/h";


    document.getElementById("visibility").textContent =
        (current.visibility / 1000).toFixed(1) + " km";


    /* Date */

    const currentDate =
        new Date(current.time);


    document.getElementById("dateTime").textContent =
        currentDate.toLocaleString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });


    /* Daily */

    const daily = data.daily;


    document.getElementById("rainChance").textContent =
        daily.precipitation_probability_max[0] + "%";


    document.getElementById("sunrise").textContent =
        formatTime(daily.sunrise[0]);


    document.getElementById("sunset").textContent =
        formatTime(daily.sunset[0]);


    /* Forecasts */

    createHourlyForecast(data.hourly);

    createDailyForecast(data.daily);

}


/* =========================================
   HOURLY FORECAST
========================================= */

function createHourlyForecast(hourly) {

    const container =
        document.getElementById("hourlyForecast");

    container.innerHTML = "";


    const count = Math.min(
        12,
        hourly.time.length
    );


    for (let i = 0; i < count; i++) {

        const date =
            new Date(hourly.time[i]);


        const [description, icon] =
            getWeatherDescription(
                hourly.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className = "hour-card";


        if (i === 0) {

            card.classList.add("active");

        }


        card.innerHTML = `

            <div class="hour-time">
                ${i === 0 ? "Now" : formatHour(date)}
            </div>

            <div class="hour-icon">
                ${icon}
            </div>

            <div class="hour-temp">
                ${Math.round(
                    hourly.temperature_2m[i]
                )}°C
            </div>

        `;


        container.appendChild(card);

    }

}


/* =========================================
   7 DAY FORECAST
========================================= */

function createDailyForecast(daily) {

    const container =
        document.getElementById("dailyForecast");

    container.innerHTML = "";


    const count = Math.min(
        7,
        daily.time.length
    );


    for (let i = 0; i < count; i++) {

        const date =
            new Date(daily.time[i]);


        const [description, icon] =
            getWeatherDescription(
                daily.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className = "day-card";


        card.innerHTML = `

            <div class="day-name">
                ${
                    i === 0
                        ? "Today"
                        : formatDay(date)
                }
            </div>

            <div class="day-weather">

                <div class="day-icon">
                    ${icon}
                </div>

                <div class="day-description">
                    ${description}
                </div>

            </div>

            <div class="day-temp">
                ${Math.round(
                    daily.temperature_2m_max[i]
                )}°
                /
                ${Math.round(
                    daily.temperature_2m_min[i]
                )}°
            </div>

            <div class="day-rain">
                💧 ${
                    daily
                    .precipitation_probability_max[i]
                }%
            </div>

        `;


        container.appendChild(card);

    }

}


/* =========================================
   TIME FUNCTIONS
========================================= */

function formatTime(time) {

    const date = new Date(time);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


function formatHour(date) {

    return date.toLocaleTimeString([], {
        hour: "numeric"
    });

}


function formatDay(date) {

    return date.toLocaleDateString([], {
        weekday: "short"
    });

}


/* =========================================
   ERROR
========================================= */

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.style.display = "block";

    weatherContent.style.display = "none";

}


function hideError() {

    errorMessage.style.display = "none";

}


/* =========================================
   DARK MODE
========================================= */

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");


    if (
        document.body.classList.contains("dark")
    ) {

        themeButton.textContent = "☀️";

        localStorage.setItem(
            "weatherTheme",
            "dark"
        );

    }

    else {

        themeButton.textContent = "🌙";

        localStorage.setItem(
            "weatherTheme",
            "light"
        );

    }

});


/* Restore theme */

if (
    localStorage.getItem("weatherTheme") === "dark"
) {

    document.body.classList.add("dark");

    themeButton.textContent = "☀️";

}


/* =========================================
   MY LOCATION
========================================= */

locationButton.addEventListener(
    "click",
    getMyLocation
);


function getMyLocation() {

    if (!navigator.geolocation) {

        showError(
            "Your browser does not support location."
        );

        return;

    }


    locationButton.textContent =
        "📍 Detecting...";


    hideError();


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            console.log(
                "Latitude:",
                latitude
            );

            console.log(
                "Longitude:",
                longitude
            );


            try {

                /*
                    Convert coordinates
                    into a city
                */

                const response =
                    await fetch(
                        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Location service unavailable."
                    );

                }


                const locationData =
                    await response.json();


                console.log(
                    "Location Data:",
                    locationData
                );


                if (
                    !locationData.results ||
                    locationData.results.length === 0
                ) {

                    throw new Error(
                        "City could not be found."
                    );

                }


                const place =
                    locationData.results[0];


                /*
                    Try different location names
                */

                const city =
                    place.city ||
                    place.town ||
                    place.village ||
                    place.municipality ||
                    place.name;


                if (!city) {

                    throw new Error(
                        "Could not identify your city."
                    );

                }


                console.log(
                    "Detected City:",
                    city
                );


                /*
                    Put city into search box
                */

                cityInput.value = city;


                /*
                    Get weather using
                    your Flask API
                */

                await loadWeather(city);

            }


            catch (error) {

                console.error(
                    "Location Error:",
                    error
                );


                showError(
                    "Location detected, but weather could not be loaded."
                );

            }


            locationButton.textContent =
                "📍 My Location";

        },


        function(error) {

            console.error(
                "GPS Error:",
                error.code,
                error.message
            );


            if (error.code === 1) {

                showError(
                    "Location permission was denied. Please allow location access for 127.0.0.1."
                );

            }

            else if (error.code === 2) {

                showError(
                    "Your laptop could not determine your location. Check Windows Location Services."
                );

            }

            else if (error.code === 3) {

                showError(
                    "Location request timed out. Please try again."
                );

            }

            else {

                showError(
                    "Unable to detect your location."
                );

            }


            locationButton.textContent =
                "📍 My Location";

        },


        {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000
        }

    );

}


/* =========================================
   DEFAULT CITY
========================================= */

loadWeather("Vijayawada");