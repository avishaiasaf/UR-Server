const { TestScheduler } = require("@jest/core");
const fs = require("fs");
const reportHandler = require("../public/javascripts/reportHandler.js");

//Test validateJournals function
var invalid_line={trannumber: 12345}

test("Check that Journal with a valid ref returns false", ()=>{
    expect(reportHandler.validateJournals(invalid_line)).toBe(false);
});

var valid_line={trannumber: 0}

test("Check that Journal with an invalid ref returns true", ()=>{
    expect(reportHandler.validateJournals(valid_line)).toBe(true);
});

//Test validateLineDicrepancy function
var invalid_amount_line = {rate: 1000, quantity: 100000, amount: 15000};

test("Check that line with amount descripancy returns a message", ()=>{
    expect(reportHandler.validateLineDicrepancy(invalid_amount_line)).toBe("Error:: 10 * 10 does not equal to 150");
});
