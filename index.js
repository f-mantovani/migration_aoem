import express from "express";
import fs from "node:fs/promises";

const app = express();
app.use(express.json());

async function getList() {
  return JSON.parse(await fs.readFile(`./list.json`, { encoding: "utf8" }));
}

app.get("/", async (req, res) => {
  let copy = await getList();
  copy = copy.sort((a, b) => a.Empire - b.Empire);

  res.status(200).json(copy);
});

app.get("/servers", async (_, res) => {
  const servers = new Set();
  const list = await getList();
  list.forEach((entry) => {
    if (!servers.has(entry.Empire)) {
      servers.add(entry.Empire);
    }
  });

  const order = [...servers].sort((a, b) => a - b);
  res.status(200).json({ servers: order });
});

app.get("/server", async (req, res) => {
  const { server } = req.query;

  const list = await getList();
  const copy = list
    .filter(({ Empire }) => +Empire === +server)
    .sort((a, b) => a.Power - b.Power);
  res.status(200).json({
    players: copy,
  });
});

app.get("/power", async (_, res) => {
  const strip = (string) => {
    return Number(string.split("M")[0]);
  };
  const copy = await getList();
  copy.sort((a, b) => strip(b.Power) - strip(a.Power));

  res.status(200).json(copy);
});

app.get("/add", async (req, res) => {
  const { ign, power, empire } = req.query;

  const newGovernor = {
    Empire: empire,
    IGN: ign,
    Power: `${power}M`,
  };
  const list = await getList();

  await fs.writeFile(
    "./list.json",
    JSON.stringify([...list, newGovernor], null, 2),
  );

  res.status(200).json(newGovernor);
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});

export default app;
