const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
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
    conn.query(`SELECT sifra_zd, ime, naziv_iz, naziv_de FROM Zdravnik JOIN Izvajalec ON Zdravnik.sifra_iz=Izvajalec.sifra_iz JOIN Dejavnost ON Zdravnik.sifra_de = Dejavnost.sifra_de`, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/id
// NOTE: currently fetches the nearest date
dataPool.fetchDoc = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ime, naziv_de, naziv_iz, enota, ulica, kraj, kolicnik, obseg, sprejem, datum FROM Zdravnik AS Z JOIN Dejavnost AS D ON Z.sifra_de = D.sifra_de JOIN Izvajalec AS I ON Z.sifra_iz = I.sifra_iz JOIN Zaposlitev_zdravnika AS Za ON Z.sifra_zd = Za.sifra_zd WHERE Z.sifra_zd = ? ORDER BY Za.datum DESC LIMIT 1`, Number(id), (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/annotation/id
dataPool.fetchComments = (id) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT id_pripombe, username, tekst FROM Zdravnik AS Z JOIN Pripomba AS P ON Z.sifra_zd = P.sifra_zd JOIN Uporabnik AS U ON U.enaslov = P.enaslov WHERE Z.sifra_zd = ?`, Number(id), (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// POST /doctor/annotation/id: text
// NOTE: session cookie
dataPool.postComment = (id, text, email) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Pripomba (tekst, sifra_zd, enaslov) VALUES (?,?,?)`, [text, id, email], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/export/id: date_start, date_end
dataPool.fetchDocRange = (id, datA, datB) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ime, naziv_de, naziv_iz, enota, ulica, kraj, obseg, kolicnik, sprejem FROM Zdravnik AS Z JOIN Dejavnost AS D ON Z.sifra_de = D.sifra_de JOIN Izvajalec AS I ON Z.sifra_iz = I.sifra_iz JOIN Zaposlitev_zdravnika AS Za ON Z.sifra_zd = Za.sifra_zd WHERE Z.sifra_zd = ? AND datum BETWEEN ? AND ?`, [Number(id), datA, datB], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /doctor/series/id: date_start, date_end, var
dataPool.fetchDocRangeSeriesObseg = (id, datA, datB) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT obseg AS value, datum AS time FROM Zdravnik AS Z JOIN Dejavnost AS D ON Z.sifra_de = D.sifra_de JOIN Izvajalec AS I ON Z.sifra_iz = I.sifra_iz JOIN Zaposlitev_zdravnika AS Za ON Z.sifra_zd = Za.sifra_zd WHERE Z.sifra_zd = ? AND datum BETWEEN ? AND ?`, [Number(id), datA, datB], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}
dataPool.fetchDocRangeSeriesKolicnik = (id, datA, datB) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT kolicnik AS value, datum AS time FROM Zdravnik AS Z JOIN Dejavnost AS D ON Z.sifra_de = D.sifra_de JOIN Izvajalec AS I ON Z.sifra_iz = I.sifra_iz JOIN Zaposlitev_zdravnika AS Za ON Z.sifra_zd = Za.sifra_zd WHERE Z.sifra_zd = ? AND datum BETWEEN ? AND ?`, [Number(id), datA, datB], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}





// user funcs

// POST /user/register: username, password, email
dataPool.registerUser = (user, pass, email) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Uporabnik (username, geslo, enaslov) VALUES (?,?,?)`, [user, pass, email], (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// GET /user/bookmarks
dataPool.listUserBookmarks = (email) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ime, Z.sifra_zd FROM Zdravnik AS Z JOIN Zaznamek AS Za ON Z.sifra_zd = Za.sifra_zd JOIN Uporabnik AS U ON Za.enaslov = U.enaslov WHERE U.enaslov = ?`, email, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

// POST /user/bookmarks
dataPool.postBookmark = (email, id) => {
  return new Promise((resolve, reject) => {
    conn.query(`INSERT INTO Zaznamek VALUES (?,?)`, [email, Number(id)], (err, res) => {
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

// special (in use only within backend)

// get the user's password
dataPool.getPassword = (username) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT geslo FROM Uporabnik WHERE username = ?`, username, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

dataPool.getEmail = (username) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT enaslov FROM Uporabnik WHERE username = ?`, username, (err, res) => {
      if (err) { return reject(err) }
      return resolve(res)
    })
  })
}

module.exports = dataPool;

