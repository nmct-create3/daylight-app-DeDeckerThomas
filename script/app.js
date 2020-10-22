// 10 Zet een gegeven aantal milliseconden om naar een leesbaar tijdstip.
const _parseMillisecondsIntoReadableTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

// 9 Voegt de is-night klasse toe op de html tag.
let letItBeNight = () => {
  document.documentElement.classList.add("is-night");
};

// 8 Verwijdert de is-night klasse van de html tag.
let letItBeDay = () => {
  document.documentElement.classList.remove("is-night");
};


// 7 Update de positie van de zon en de resterende tijd.
const updateSun = (sun, leftPercent, bottomPercent, now) => {
  sun.style.left = `${leftPercent}%`;
  sun.style.bottom = `${bottomPercent}%`;
  sun.setAttribute("data-time",`${_parseMillisecondsIntoReadableTime(now / 1000)}`);
};

// 6 Checkt of de zon onder is en berekent op basis daarvan de positie van de zon.
const calculateSunPosition = (timeUp, totalMinutes) => {
  return timeUp < 0 || timeUp > totalMinutes
    ? {
        now: new Date(),
        left: 100,
        bottom: -20,
      } : {
        now: (now = new Date()),
        left: (timeUp / totalMinutes) * 100,
        bottom: Math.cos(Math.asin(((timeUp / totalMinutes) * 100 - 50) / 50)) * 100,
      };
};

// 5 Update van de app.
const updateApp = (timeUp, totalMinutes, sun, timeLeft) => {
  // Bekijkt of de zon onder is voor het plaatsen van de is-night klasse.
  if (timeUp < 0 || timeUp > totalMinutes) {
    letItBeNight();
  } else {
    letItBeDay();
  }
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  position = calculateSunPosition(timeUp, totalMinutes);
  updateSun(sun, position.left, position.bottom, position.now);
  // Vergeet niet om het resterende aantal minuten in te vullen.
  timeLeft.innerText = Math.round(totalMinutes - timeUp) < 0 ? 0: Math.round(totalMinutes - timeUp);
};

// 4 Haalt de juist DOM elementen op en berekent hoe lang de zon al op is.
const placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	// Bepaal het aantal minuten dat de zon al op is.
  const sun = document.querySelector(".js-sun"),
    timeLeft = document.querySelector(".js-time-left");
  let now = new Date(),
    timeUp = Math.floor((now / 1000 - sunrise) / 60);

  updateApp(timeUp, totalMinutes, sun, timeLeft);

  // Nu maken we een functie die de zon elke minuut zal updaten.
  const timer = setInterval(() => {(now = new Date()), (timeUp = Math.floor((now / 1000 - sunrise) / 60));
    updateApp(timeUp, totalMinutes, sun, timeLeft);
    if (timeUp < 0 || timeUp > totalMinutes) {
      clearInterval(timer);
    }
  }, 10);
};

// 3 Met de data van de API kunnen we de app opvullen.
const showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen.
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  document.querySelector(".js-location").innerText = `${queryResponse.city.name}, ${queryResponse.city.country}`;
  document.querySelector(".js-sunrise").innerText = `${_parseMillisecondsIntoReadableTime(queryResponse.city.sunrise)}`;
  document.querySelector(".js-sunset").innerText = `${_parseMillisecondsIntoReadableTime(queryResponse.city.sunset)}`;
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  const timeDifference = (queryResponse.city.sunset - queryResponse.city.sunrise) / 60;
  placeSunAndStartMoving(timeDifference, queryResponse.city.sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
const getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op.
  // Met de fetch API proberen we de data op te halen.
	// Als dat gelukt is, gaan we naar onze showResult functie.
  const data = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=nl&cnt=1`)
    .then((response) => response.json())
    .catch((error) => console.log("An error occured:", error));
  showResult(data);
};

// 1 Wachten tot het DOM geladen is.
document.addEventListener("DOMContentLoaded", function () {
  navigator.geolocation.getCurrentPosition((position) => {
    getAPI(position.coords.latitude, position.coords.longitude);
  });
});
