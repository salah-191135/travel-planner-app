const { getCoordinates, getWeather, getDestinationImage } = require('../client/app');
const fetch = require('node-fetch');

jest.mock('node-fetch');

describe('API Functions', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    test('getCoordinates returns correct data', async () => {
        const mockData = {
            geonames: [{ lat: 40.7128, lng: -74.006, countryName: 'United States' }]
        };
        fetch.mockResolvedValue({ json: () => Promise.resolve(mockData) });

        const result = await getCoordinates('New York');
        expect(result).toEqual({
            lat: 40.7128,
            lng: -74.006,
            country: 'United States'
        });
    });

    test('getWeather returns correct data', async () => {
        const mockData = {
            data: [{ temp: 15, weather: { description: 'Clear', icon: 'c01d' } }]
        };
        fetch.mockResolvedValue({ json: () => Promise.resolve(mockData) });

        const result = await getWeather({ lat: 40.7128, lng: -74.006 }, '2023-10-01');
        expect(result).toEqual({
            temp: 15,
            description: 'Clear',
            icon: 'c01d'
        });
    });

    test('getDestinationImage returns fallback image', async () => {
        const mockData = { hits: [] };
        fetch.mockResolvedValue({ json: () => Promise.resolve(mockData) });

        const result = await getDestinationImage('Unknown Location', 'Unknown Country');
        expect(result).toBe('default-image.jpg');
    });
});