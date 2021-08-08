import sqlite3 from "sqlite3";

let db = new sqlite3.Database("./db/loc.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

const sql = `CREATE TABLE IF NOT EXISTS locs (
      id INTEGER PRIMARY KEY,
      lat FLOAT NOT NULL,
      long FLOAT NOT NULL
  )`;
db.exec(sql, (err) => {
  if (err) throw err;
});
