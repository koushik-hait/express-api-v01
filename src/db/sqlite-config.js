import sqlite3 from "sqlite3";

// const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("cache.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT,
      expiresAt INTEGER
    )
  `);
});

export const getCache = (key) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT value FROM cache WHERE key = ? AND expiresAt > ?",
      [key, Date.now()],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(JSON.parse(row.value));
        } else {
          resolve(null);
        }
      }
    );
  });
};

export const deleteCache = (key) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM cache WHERE key = ?", [key], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const setCache = (key, value, ttl) => {
  const expiresAt = Date.now() + ttl;
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT OR REPLACE INTO cache (key, value, expiresAt) VALUES (?, ?, ?)",
      [key, JSON.stringify(value), expiresAt],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};

//how to use
// const key = "data";
// const cachedData = await getCache(key);
// if (cachedData) {
//   res.json(cachedData);
// } else {
//   const data = await fetchDataFromAPI(); // Your API call
//   await setCache(key, data, 60000); // Cache for 60 seconds
//   res.json(data);
// }
