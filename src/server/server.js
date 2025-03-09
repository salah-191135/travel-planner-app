require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('website'));

// Routes

// Geonames API Proxy
app.get('/api/geonames/:location', async (req, res) => {
    try {
        const response = await fetch(
            `http://api.geonames.org/searchJSON?q=${req.params.location}&maxRows=1&username=${process.env.GEONAMES_USERNAME}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
});

// Weatherbit API Proxy
app.get('/api/weatherbit/:lat/:lng/:date', async (req, res) => {
    try {
        const { lat, lng, date } = req.params;
        const daysDiff = Math.ceil((new Date(date) - new Date()) / (1000 * 3600 * 24));
        const endpoint = daysDiff <= 7 ? 'current' : 'forecast/daily';

        // console.log(`https://api.weatherbit.io/v2.0/${endpoint}?lat=${lat}&lon=${lng}&key=${process.env.WEATHERBIT_KEY}&units=M`);

        const response = await fetch(
            `https://api.weatherbit.io/v2.0/${endpoint}?lat=${lat}&lon=${lng}&key=${process.env.WEATHERBIT_KEY}&units=M`
        );
        const data = await response.json();
        res.json(data);
        // console.log(data);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Pixabay API Proxy
app.get('/api/pixabay/:query', async (req, res) => {
    try {
        const response = await fetch(
            `https://pixabay.com/api/?key=${process.env.PIXABAY_KEY}&q=${encodeURIComponent(req.params.query)}&image_type=photo`
        );
        const data = await response.json();
        res.json(data);
        // console.log(data);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});