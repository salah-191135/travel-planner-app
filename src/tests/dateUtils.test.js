const { calculateTripLength } = require('../client/app');

describe('calculateTripLength', () => {
    test('calculates correct trip length for 1 day', () => {
        const start = '2023-10-01';
        const end = '2023-10-01';
        expect(calculateTripLength(start, end)).toBe(1);
    });

    test('calculates correct trip length for multiple days', () => {
        const start = '2023-10-01';
        const end = '2023-10-05';
        expect(calculateTripLength(start, end)).toBe(5);
    });

    test('throws error for invalid dates', () => {
        const start = 'invalid-date';
        const end = '2023-10-05';
        expect(() => calculateTripLength(start, end)).toThrow();
    });
});