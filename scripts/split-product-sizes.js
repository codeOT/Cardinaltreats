const fs = require("fs");
const { MongoClient } = require("mongodb");

function readMongoUri() {
  const raw = fs.readFileSync(".env.local", "utf8");
  const line = raw.split(/\r?\n/).find((l) => l.startsWith("MONGODB_URI="));
  if (!line) throw new Error("MONGODB_URI not found in .env.local");
  return line.slice("MONGODB_URI=".length).trim().replace(/^"|"$/g, "");
}

function readDbName() {
  const raw = fs.readFileSync(".env.local", "utf8");
  const line = raw.split(/\r?\n/).find((l) => l.startsWith("MONGODB_DB="));
  return line ? line.slice("MONGODB_DB=".length).trim().replace(/^"|"$/g, "") : "cardinaltreats";
}

function toSlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function run() {
  const uri = readMongoUri();
  const dbName = readDbName();
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("products");

  const products = await col.find({}).toArray();
  const keep = [];
  const split = [];
  for (const p of products) {
    const weightNum = Number(String(p.weight || "").replace(/[^\d]/g, ""));
    const has50 = p.stockQty50 != null || p.price50 != null;
    const has100 = p.stockQty100 != null || p.price100 != null;
    if ((weightNum === 50 || weightNum === 100) && !(has50 && has100)) {
      keep.push(p);
    } else {
      split.push(p);
    }
  }

  let maxId = products.reduce((m, p) => Math.max(m, Number(p.id || 0)), 0);
  let maxSort = products.reduce((m, p) => Math.max(m, Number(p.sortOrder || 0)), 0);
  const nextDocs = [...keep];

  for (const p of split) {
    const baseName = String(p.name || "").trim();
    const baseSlug = toSlug(p.slug || p.name);
    const legacyPrice = Number(p.price || 0);
    const price100 = Number(p.price100 ?? legacyPrice);
    const price50 = Number(p.price50 ?? (price100 > 0 ? Math.round(price100 / 2) : 0));
    const stock50 = Number(p.stockQty50 ?? p.stockQty ?? 0);
    const stock100 = Number(p.stockQty100 ?? p.stockQty ?? 0);

    maxId += 1;
    maxSort += 1;
    nextDocs.push({
      ...p,
      _id: undefined,
      id: maxId,
      sortOrder: maxSort,
      weight: "100g",
      price: price100,
      price100,
      price50: undefined,
      stockQty100: Math.max(0, stock100),
      stockQty50: 0,
      stockQty: 0,
      slug: `${baseSlug}-100g`,
      name: baseName,
    });

    maxId += 1;
    maxSort += 1;
    nextDocs.push({
      ...p,
      _id: undefined,
      id: maxId,
      sortOrder: maxSort,
      weight: "50g",
      price: price50,
      price50,
      price100: undefined,
      stockQty50: Math.max(0, stock50),
      stockQty100: 0,
      stockQty: 0,
      slug: `${baseSlug}-50g`,
      name: baseName,
    });
  }

  await col.deleteMany({});
  if (nextDocs.length) {
    await col.insertMany(nextDocs.map(({ _id, ...rest }) => rest));
  }

  console.log(
    JSON.stringify(
      {
        originalCount: products.length,
        keptCount: keep.length,
        splitSourceCount: split.length,
        finalCount: nextDocs.length,
      },
      null,
      2
    )
  );
  await client.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
