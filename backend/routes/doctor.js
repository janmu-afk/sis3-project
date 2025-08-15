const express = require("express")
const doctor = express.Router();
const DB = require('../db/dbConn.js')
const json2csv = require("json2csv")

// doctor info

// GET /doctor/list
// retrieves a list of all doctors (used for search)
doctor.get('/list', async (req, res, next) => {
    try {
        var queryResult = await DB.listDocs();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// GET /doctor/id
// fetches information about a particular doctor
doctor.get('/:id', async (req, res, next) => {
    try {
        var queryResult = await DB.fetchDoc(req.params.id);
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})


// GET /doctor/annotation/id
// fetches all annotations made about a specific doctor
doctor.get('/annotation/:id', async (req, res, next) => {
    try {
        var queryResult = await DB.fetchAnnotations(req.params.id);
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// POST /doctor/annotation/id: text
// posts an annotation about a doctor (auth required)
doctor.get('/annotation/:id', async (req, res, next) => {
    var text = req.body.text + ""
    if (req.session.logged_in) {
        try {
            var queryResult = await DB.postAnnotations(req.params.id, text);
            res.json(queryResult)
        }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
    }
})

// GET /doctor/export/id, date-start, date_end, format(json/csv)
// fetches doctor info in a date range and returns a file in a chosen format
doctor.get('/export/:id', async (req, res, next) => {
    var date_start = req.body.date_start;
    var date_end = req.body.date_end;
    var format = req.body.format;

    try {
        var queryResult = await DB.fetchDocRange(req.params.id, date_start, date_end);
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

    if (format == 'json') {
        res.json(queryResult);
    }
    else if (format == 'csv') {
        // convert json to csv
        try {
            const opts = {};
            const parser = new Parser(opts);
            const csv = parser.parse(queryResult);
            console.log(csv);
        } catch (err) {
            console.error(err);
        }
    }
    else {
        res.json({ success: false, message: "invalid format choice, use csv/json" });
    }
})

// GET /doctor/comparison/id?date_start=&date_end=
// fetches doctor info and constructs line chart data
doctor.get('/comparison/:id', async (req, res, next) => {
    var date_start = req.body.date_start;
    var date_end = req.body.date_end;
    try {
        var queryResult = await DB.fetchDocRange(req.params.id, date_start, date_end);
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }

    // graph construction
    // Recharts uses { time: 'YYYY-MM-DD', value: x } formatting
})

// helper funcs

// GET /doctor/provider/list
doctor.get('/provider/list', async (req, res, next) => {
    try {
        var queryResult = await DB.listProviders();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

// GET /doctor/specialization/list
doctor.get('/specialization/list', async (req, res, next) => {
    try {
        var queryResult = await DB.listSpecializations();
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

module.exports = doctor;