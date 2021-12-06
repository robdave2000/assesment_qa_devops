const {shuffleArray} = require('./utils')

describe('shuffleArray should', () => {
    test('array length', () => {
        expect(shuffleArray([1,2,3,4])).toEqual(shuffleArray().length())
    })
})