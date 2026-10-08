from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)


# -----------------------------------------
# Weather descriptions
# -----------------------------------------

def get_weather_description(code):

    weather_codes = {
        0: ("Clear Sky", "☀️"),
        1: ("Mainly Clear", "🌤️"),
        2: ("Partly Cloudy", "⛅"),
        3: ("Overcast", "☁️"),
        45: ("Fog", "🌫️"),
        48: ("Fog", "🌫️"),
        51: ("Light Drizzle", "🌦️"),
        53: ("Drizzle", "🌦️"),
        55: ("Heavy Drizzle", "🌧️"),
        56: ("Freezing Drizzle", "🌧️"),
        57: ("Freezing Drizzle", "🌧️"),
        61: ("Light Rain", "🌦️"),
        63: ("Rain", "🌧️"),
        65: ("Heavy Rain", "🌧️"),
        66: ("Freezing Rain", "🌧️"),
        67: ("Freezing Rain", "🌧️"),
        71: ("Light Snow", "🌨️"),
        73: ("Snow", "❄️"),
        75: ("Heavy Snow", "❄️"),
        77: ("Snow Grains", "❄️"),
        80: ("Rain Showers", "🌦️"),
        81: ("Rain Showers", "🌧️"),
        82: ("Heavy Rain Showers", "⛈️"),
        85: ("Snow Showers", "🌨️"),
        86: ("Heavy Snow Showers", "❄️"),
        95: ("Thunderstorm", "⛈️"),
        96: ("Thunderstorm with Hail", "⛈️"),
        99: ("Thunderstorm with Hail", "⛈️")
    }

    return weather_codes.get(code, ("Unknown", "🌤️"))


# -----------------------------------------
# Get weather
# -----------------------------------------

def get_weather(city):

    # Geocoding API
    geo_url = "https://geocoding-api.open-meteo.com/v1/search"

    geo_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    geo_response = requests.get(
        geo_url,
        params=geo_params,
        timeout=10
    )

    geo_data = geo_response.json()

    if "results" not in geo_data:
        return None

    location = geo_data["results"][0]

    latitude = location["latitude"]
    longitude = location["longitude"]

    # Weather API
    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": ",".join([
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "wind_speed_10m",
            "visibility"
        ]),

        "hourly": ",".join([
            "temperature_2m",
            "weather_code",
            "precipitation_probability"
        ]),

        "daily": ",".join([
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "sunrise",
            "sunset",
            "precipitation_probability_max"
        ]),

        "forecast_days": 7,

        "timezone": "auto"
    }

    weather_response = requests.get(
        weather_url,
        params=weather_params,
        timeout=10
    )

    weather_data = weather_response.json()

    if "current" not in weather_data:
        return None

    current = weather_data["current"]

    return {
        "location": {
            "city": location["name"],
            "country": location.get("country", ""),
            "latitude": latitude,
            "longitude": longitude
        },

        "current": current,

        "hourly": weather_data.get("hourly", {}),

        "daily": weather_data.get("daily", {}),

        "timezone": weather_data.get("timezone", "")
    }


# -----------------------------------------
# Home page
# -----------------------------------------

@app.route("/")
def home():

    return render_template("index.html")


# -----------------------------------------
# Weather API route
# -----------------------------------------

@app.route("/weather")
def weather():

    city = request.args.get("city")

    if not city:

        return jsonify({
            "error": "Please enter a city name."
        }), 400

    try:

        weather = get_weather(city)

        if weather is None:

            return jsonify({
                "error": "City not found."
            }), 404

        return jsonify(weather)

    except requests.exceptions.RequestException:

        return jsonify({
            "error": "Unable to connect to weather service."
        }), 500

    except Exception as e:

        print("ERROR:", e)

        return jsonify({
            "error": "Something went wrong."
        }), 500


if __name__ == "__main__":

    app.run(
        debug=True
    )