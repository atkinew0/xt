//tests for our SRS function
const timedue = require('../timedue')

test("testing calcdue", () => {

})

describe("Testing correctly answered",() => {

    test("testing update on correct answer reps, days (0,0)", () => {
        expect(timedue.calcDue(0,0)).toHaveProperty("futureDays":1)
    })

    test("testing update on correct answer reps, days (1,1)", () => {
        expect(timedue.calcDue(1,1)).toHaveProperty("futureDays":4)
    })

    test("testing update on correct answer", () => {
        expect(timedue.calcDue(2,4)).toHaveProperty("futureDays":8)
    })

    test("testing update on correct answer", () => {
        expect(timedue.calcDue(2,4)).toHaveProperty("futureDays":8)
    })

    test("testing erroneous null parameters", () => {
        expect(timedue.calcDue(null,null)).toHaveProperty("futureDays":0)
    })

})

describe("Testing incorrectly answered questions, ", () => {

    test("testing update on failed answer ,10, 10",() => {
    
        expect(timedue.calcFail(10,10)).toHaveProperty("futureDays":0);
    })

    test("testing update on failed answer",() => {
    
        expect(timedue.calcFail(10,0)).toHaveProperty("futureDays":0);
    })

    test("testing update on failed answer",() => {
    
        expect(timedue.calcFail(0,10)).toHaveProperty("futureDays":0);
    })

    test("testing erroneous null parameters", () => {
        expect(timedue.calcFail(null,null)).toHaveProperty("futureDays":0)
    })
})
