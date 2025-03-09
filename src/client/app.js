import './style.scss';

const API_BASE_URL = 'http://localhost:5000/api';
let currentTrip = null;

// Helper Functions
function calculateTripLength(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate - startDate;
    return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
}

// API Functions
async function getCoordinates(location) {
    // console.log(`${API_BASE_URL}/geonames/${encodeURIComponent(location)}`);

    const response = await fetch(`${API_BASE_URL}/geonames/${encodeURIComponent(location)}`);
    const data = await response.json();

    if (!data.geonames || data.geonames.length === 0) {
        throw new Error('Location not found');
    }

    return {
        lat: data.geonames[0].lat,
        lng: data.geonames[0].lng,
        country: data.geonames[0].countryName
    };
}

async function getWeather(coords, date) {
    const response = await fetch(
        `${API_BASE_URL}/weatherbit/${coords.lat}/${coords.lng}/${date}`
    );
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
        throw new Error('Weather data not available');
    }

    const weatherData = data.data[0];
    return {
        temp: weatherData.temp,
        description: weatherData.weather.description,
        icon: weatherData.weather.icon
    };
}

async function getDestinationImage(location, country) {
    try {
        // Try location first
        const locationResponse = await fetch(`${API_BASE_URL}/pixabay/${encodeURIComponent(location)}`);
        const locationData = await locationResponse.json();
        // console.log(locationData);


        if (locationData.hits.length > 0) {
            return locationData.hits[0].largeImageURL;
        }

        // Fallback to country
        const countryResponse = await fetch(`${API_BASE_URL}/pixabay/${encodeURIComponent(country)}`);
        const countryData = await countryResponse.json();

        return countryData.hits[0]?.largeImageURL || 'default-image.jpg';
    } catch (error) {
        console.error('Image fetch error:', error);
        return 'default-image.jpg';
    }
}

// Event Listeners and UI Functions
document.addEventListener('DOMContentLoaded', () => {
    renderSavedTrips();

    document.getElementById('show-form-btn').addEventListener('click', showForm);
    document.getElementById('cancel-form').addEventListener('click', hideForm);
    document.getElementById('travelForm').addEventListener('submit', handleFormSubmit);
});

function showForm() {
    document.getElementById('trip-form').classList.remove('hidden');
    document.getElementById('banner').classList.add('hidden');
}

function hideForm() {
    document.getElementById('trip-form').classList.add('hidden');
    document.getElementById('banner').classList.remove('hidden');
    document.getElementById('travelForm').reset();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const location = document.getElementById('location').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    try {
        const coords = await getCoordinates(location);
        const weather = await getWeather(coords, startDate);
        const image = await getDestinationImage(location, coords.country);
        const tripLength = calculateTripLength(startDate, endDate);

        currentTrip = {
            location,
            startDate,
            endDate,
            tripLength,
            coords,
            weather,
            image
        };

        showTripPreview();
    } catch (error) {
        alert(error.message);
    }
}

function showTripPreview() {
    const previewContent = document.getElementById('preview-content');
    previewContent.innerHTML = `
        <div class="place">
            <img src="${currentTrip.image}" class="destination-image" alt="${currentTrip.location}">
            <p><strong>Destination:</strong> ${currentTrip.location}</p>
        </div>
        <div class="trip-info">
            <p><strong>Country:</strong> ${currentTrip.coords.country}</p>
            <p><strong>Dates:</strong> ${currentTrip.startDate} to ${currentTrip.endDate}</p>
            <p><strong>Duration:</strong> ${currentTrip.tripLength} days</p>
            <div class="weather-info">
                <p>${currentTrip.weather.temp}°C, ${currentTrip.weather.description}</p>
                <img src="https://www.weatherbit.io/static/img/icons/${currentTrip.weather.icon}.png" alt="Weather icon">
            </div>
            <div class="trip-actions">
                <button id="save-trip" class="btn">Save Trip</button>
                <button id="discard-trip" class="btn btn-secondary">Discard</button>
            </div>
        </div>
    `;
    document.getElementById('save-trip').addEventListener('click', saveTrip);
    document.getElementById('discard-trip').addEventListener('click', discardTrip);


    document.getElementById('current-trip').classList.remove('hidden');
    document.getElementById('trip-form').classList.add('hidden');
}

function saveTrip() {
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const tripWithId = { ...currentTrip, id: Date.now() };
    trips.push(tripWithId);
    localStorage.setItem('trips', JSON.stringify(trips));
    renderSavedTrips();
    discardTrip();
}

function discardTrip() {
    currentTrip = null;
    document.getElementById('current-trip').classList.add('hidden');
    document.getElementById('banner').classList.remove('hidden');
    document.getElementById('travelForm').reset();
}

function renderSavedTrips() {
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const tableBody = document.getElementById('trips-table');

    tableBody.innerHTML = trips.map(trip => `
        <tr>
            <td>${trip.location}</td>
            <td>${trip.startDate} to ${trip.endDate}</td>
            <td>${trip.tripLength} days</td>
            <td>
                ${trip.weather.temp}°C, ${trip.weather.description}
            </td>
            <td>
                <button class="btn" onclick="deleteTrip('${trip.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function deleteTrip(id) {
    let trips = JSON.parse(localStorage.getItem('trips')) || [];
    trips = trips.filter(trip => trip.id !== Number(id));
    localStorage.setItem('trips', JSON.stringify(trips));
    renderSavedTrips();
}