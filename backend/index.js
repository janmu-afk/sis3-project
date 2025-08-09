// a note on endpoint comment syntax
// ?x=&y= implies HEADER params
// : x, y implies BODY params


// import dependencies and initialize the express app
const express = require('express')
require('dotenv').config()
const app = express()
const cors = require("cors")
const path = require('path')
const port = process.env.PORT || 5916

// import local files
const user = require('./routes/users')
const doctor = require('./routes/doctor')

const session = require('express-session')


app.set('trust proxy', 1) // trust first proxy
app.use(session({
   secret: 'some secret',
   resave: true,
   saveUninitialized: true,
   cookie: { secure: false }
  }))


//Some configurations
app.use(express.urlencoded({extended : true}));
app.use(cors({
   origin: 'http://localhost:5918',
   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
   credentials: true
}))


// configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  methods: ["GET", "POST"],
}))

// actual routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"))
})

app.use('/doctor', doctor)
app.use('/user', user)

// start the express server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
