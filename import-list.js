import fs from "fs/promises";
import Database from "better-sqlite3";

const db = new Database("data.db");

const json = JSON.parse(await fs.readFile("./list.json", "utf8"));

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS governors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Empire INTEGER,
    IGN TEXT,
    Power TEXT,
    PowerNum REAL
  )
`,
).run();

const toNumber = (power) => Number(power.replace("M", ""));

const insert = db.prepare(`
  INSERT INTO governors (Empire, IGN, Power, PowerNum)
  VALUES (?, ?, ?, ?)
`);

db.transaction(() => {
  for (const g of json) {
    insert.run(g.Empire, g.IGN, g.Power, toNumber(g.Power));
  }
})();

console.log(`Importados ${json.length} registros.`);
