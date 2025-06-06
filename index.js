import express from "express";
import Database from "better-sqlite3";

const app = express();
app.use(express.json());

const db = new Database("data.db");

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

app.get("/", (req, res) => {
  const list = db.prepare("SELECT * FROM governors ORDER BY Empire ASC").all();
  res.status(200).json(list);
});

app.get("/servers", (_, res) => {
  const servers = db
    .prepare("SELECT DISTINCT Empire FROM governors")
    .all()
    .map((s) => s.Empire)
    .sort((a, b) => a - b);
  res.status(200).json({ servers });
});

app.get("/server", (req, res) => {
  const { server } = req.query;
  const list = db
    .prepare("SELECT * FROM governors WHERE Empire = ? ORDER BY PowerNum DESC")
    .all(server);
  res.status(200).json({ players: list });
});

app.get("/power", (_, res) => {
  const list = db
    .prepare("SELECT * FROM governors ORDER BY PowerNum DESC")
    .all();
  res.status(200).json(list);
});

app.get("/add", (req, res) => {
  const { ign, power, empire } = req.query;
  const powerStr = `${power}M`;
  const powerNum = Number(power);

  const stmt = db.prepare(`
    INSERT INTO governors (Empire, IGN, Power, PowerNum)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(empire, ign, powerStr, powerNum);

  res.status(200).json({
    Empire: Number(empire),
    IGN: ign,
    Power: powerStr,
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
