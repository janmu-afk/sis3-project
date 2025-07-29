const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'Qcodeigniter',
})

conn.connect((err) => {
  if (err) {
    console.log("ERROR: " + err.message);
    return;
  }
  console.log('Connection established');
})


let dataPool = {}

// doctor info

// GET /doctor/list
dataPool.listDocs = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ime, naziv_iz, naziv_de FROM Zdravnik JOIN Izvajalec ON Zdravnik.sifra_iz=Izvajalec.sifra_iz JOIN Dejavnost ON Zdravnik.sifra_de = Dejavnost.sifra_de`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/id
// NOTE: might need to rewrite later
dataPool.fetchDoc = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ime, naziv_de, naziv_iz, enota, ulica, kraj, obseg, kolicnik, sprejem FROM Zdravnik AS Z JOIN Dejavnost AS D ON Z.sifra_de = D.sifra_de JOIN Izvajalec AS I ON Z.sifra_iz = I.sifra_iz JOIN Zaposlitev_zdravnika AS Za ON Z.sifra_zd = Za.sifra_zd WHERE datum = CURDATE() AND sifra_zd = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/annotation/id
dataPool.fetchAnnotations = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT username, tekst FROM Zdravnik AS Z JOIN Pripomba AS P ON Z.sifra_zd = P.sifra_zd JOIN Uporabnik AS U ON U.enaslov = P.enaslov WHERE sifra_zd = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// POST /doctor/annotation/id?text=
// NOTE: session cookie
dataPool.postAnnotations = (id, text, email) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Pripomba (tekst, sifra_zd, enaslov) VALUES (?,?,?)`, [text, id, email], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/export/id?date-start=&date_end=&format=
dataPool.fetchDocRange = (id, datA, datB) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ime, naziv_de, naziv_iz, enota, ulica, kraj, obseg, kolicnik, sprejem FROM Zdravnik AS Z JOIN Dejavnost AS D ON Z.sifra_de = D.sifra_de JOIN Izvajalec AS I ON Z.sifra_iz = I.sifra_iz JOIN Zaposlitev_zdravnika AS Za ON Z.sifra_zd = Za.sifra_zd WHERE sifra_zd = ? AND datum BETWEEN ? AND ?`, [id, datA, datB], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}


// GET /doctor/comparison/id?date_start=&date_end=&arg=
dataPool.fetchDocRange = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT obseg, kolicnik FROM Zaposlitev_zdravnika AS Za JOIN Zdravnik AS Z ON Za.sifra_zd = Z.sifra_zd WHERE sifra_zd = ?`, id, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}


// helper funcs

// GET /doctor/provider/list
dataPool.listProviders = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT naziv_iz FROM Izvajalec`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/specialization/list
dataPool.listSpecializations = () => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT naziv_de FROM Dejavnost`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}


// user funcs

// POST /user/login?=user&pass=
// GET /user/logout
// GET /user/session
// GET /user/bookmarks
// POST /user/bookmarks/id

module.exports = dataPool;

