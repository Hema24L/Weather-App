const apiKey="API-Key";

document.getElementById("city-btn").addEventListener("click", getWeatherData);

async function getWeatherData() {
    const cityInput = document.getElementById("city-input");
    const cityName = cityInput.value.trim();

    const errorMessage = document.getElementById("errorMessage");
    const cityNameEl = document.getElementById("City-desc");
    const temperatureEl = document.getElementById("temperature");
    const descriptionEl = document.getElementById("description");
    const button = document.getElementById("city-btn");
    const searchBox = document.getElementById("search");
    const aqi = document.getElementById("airQuality")

    errorMessage.textContent = "";

    if (cityName === "") {
        errorMessage.textContent = "Please enter a city name.";
        resetToDefault();
        return;
    }

    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    try {
        button.disabled = true;
        button.textContent = "Loading...";

        const response = await fetch(apiURL);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "City not found");
        }

        const data = await response.json();

        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        temperatureEl.textContent = `${data.main.temp}°C`;
        descriptionEl.textContent = `${data.weather[0].description}`;

        searchBox.classList.add("top-right");
        document.getElementById("app-heading").classList.add("top-left");
        changeBackground(data.weather[0].main);
        
        const lat = data.coord.lat;
        const lon = data.coord.lon;

        loadForecast(lat, lon);


    } catch (error) {
        errorMessage.textContent = error.message;
        resetToDefault();

    } finally {
        button.disabled = false;
        button.textContent = "Get Weather";
    }
}

function resetToDefault() {
    document.body.style.backgroundImage = `url("assets/images/default.jpg")`;
    document.getElementById("search").classList.remove("top-right");
    document.getElementById("app-heading").classList.remove("top-left");

    document.querySelector(".weather-card").style.display = "none";
    document.querySelector(".temperature-forecast").style.display = "none";

    if (chartInstance) {
        chartInstance.destroy();
    }

    document.getElementById("City-desc").textContent = "";
    document.getElementById("temperature").textContent = "";
    document.getElementById("description").textContent = "";
}

function changeBackground(weatherCondition){
    const condition = weatherCondition.toLowerCase();
    const background = {
        clear: "assets/images/sunny.jpg",
        clouds: "assets/images/cloudy.jpg",
        rain: "assets/images/rainy.jpeg",
        snow: "assets/images/snowy.jpg",
        thunderstorm: "assets/images/stormy.jpg",
        fog: "assets/images/foggy.jpg",
        tornado: "assets/images/tornado.jpg",
        squall: "assets/images/rainy.jpg",
        drizzle: "assets/images/rainy.jpg",
        mist: "assets/images/mist.jpg",
        smoke: "assets/images/smoke.jpeg",
        haze: "assets/images/foggy.jpg",
        dust: "assets/images/dust.jpg",
        sand: "assets/images/dust.jpg",
        ash: "assets/images/ash.png"
    };
    const imagePath = background[condition] || "assets/images/default.jpg";
    document.body.style.backgroundImage = `url(${imagePath})`;
}

let weatherChart;

async function loadForecast(lat, lon) {

    document.querySelector(".weather-card").style.display = "block";
    document.querySelector(".temperature-forecast").style.display = "block";
    document.getElementById("errorMessage").textContent = "";

    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );

    const data = await response.json();

    const labels = [];
    const temps = [];

    for (let i = 0; i < data.list.length; i += 8) {
        const date = new Date(data.list[i].dt_txt);
        labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
        temps.push(Math.round(data.list[i].main.temp));
    }

    const ctx = document.getElementById("weatherChart");

    if (weatherChart) {
        weatherChart.destroy();
    }

    weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "5-Day Forecast in Temperature(°C)",
                data: temps,
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "5-Day Temperature Forecast",
                    color: "white",
                    font: {
                        size: 18
                    }
                },
                legend: {
                    labels: {
                        color: "white"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "white"
                    },
                    title: {
                        display: true,
                        text: "Day",
                        color: "white"
                    }
                },
                y: {
                    ticks: {
                        color: "white",
                        callback: function(value) {
                            return value + "°C";
                        }
                    },
                    title: {
                        display: true,
                        text: "Temperature (°C)",
                        color: "white"
                    }
                }
            }
        }
    });
}
