const express = require("express")
const doctor = express.Router();
const DB = require('../db/dbConn.js')
const { Parser } = require('json2csv');

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


// GET /doctor/export/id, date-start, date_end, format(json/csv)
// fetches doctor info in a date range and returns a file in a chosen format
doctor.post('/export/:id', async (req, res, next) => {
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
            // wizardry to sanitize the csv (it keeps stringifying everything)
            const fields = queryResult.length ? Object.keys(queryResult[0]) : [];
            const parser = new Parser({ fields, header: false });
            const csv = parser.parse(queryResult);
            const header  = fields.join(',');                     // unquoted header
            const csvReal = header + '\n' + csv;
            //console.log(csv);
            return res.status(200).send(csvReal);
        } catch (err) {
            console.error(err);
        }
    }
    else {
        res.json({ success: false, message: "invalid format choice, use csv/json" });
    }
})


// GET /doctor/series/id: date_start=&date_end=
// fetches doctor info and constructs line chart data
doctor.get('/series/:id', async (req, res, next) => {
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


// POST /doctor/comment/:id: text
doctor.post('/comment/:id',  async (req, res, next) => {
    var id = req.params.id;
    var text = req.body.text;
    var email = req.session.email
    if (req.session.logged_in && text) {
        try { var query = await DB.postComment(id, text, email); }
        catch (err) {
            console.log(err)
            res.sendStatus(500)
        }
        res.sendStatus(200)
    }
})

// GET /doctor/comment/id
// fetches all comments made about a specific doctor
doctor.get('/comment/:id', async (req, res, next) => {
    try {
        var queryResult = await DB.fetchComments(req.params.id);
        res.json(queryResult)
    }
    catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
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