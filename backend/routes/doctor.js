const express = require("express")
const doctor = express.Router();
const DB = require('../db/dbConn.js')

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

// POST /doctor/annotation/id?text=
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

// GET /doctor/export/id?date-start=&date_end=&format=
// fetches doctor info in a date range

// GET /doctor/comparison/id?date_start=&date_end=
// fetches doctor info and constructs line chart data

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