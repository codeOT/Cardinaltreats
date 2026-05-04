const fs = require("fs");
const { MongoClient } = require("mongodb");

function readEnvValue(key, fallback = "") {
  const raw = fs.readFileSync(".env.local", "utf8");
  const line = raw.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  if (!line) return fallback;
  return line.slice(key.length + 1).trim().replace(/^"|"$/g, "");
}

function normalizeBaseSlug(slug) {
  return String(slug || "")
    .toLowerCase()
    .replace(/-carton$/, "")
    .replace(/-(50g|100g)$/, "")
    .trim();
}

function makeCartonFromPouch(pouch, nextId, nextSort, cartonUnits) {
  const stock50 = Number(pouch.stockQty50 ?? 0);
  const stock100 = Number(pouch.stockQty100 ?? 0);
  const stockLegacy = Number(pouch.stockQty ?? 0);
  const baseStock = Math.max(stock50, stock100, stockLegacy, 0);
  const cartonStock = Math.floor(baseStock / cartonUnits);

  return {
    ...pouch,
    _id: undefined,
    id: nextId,
    sortOrder: nextSort,
    packType: "carton",
    slug: `${normalizeBaseSlug(pouch.slug)}-carton`,
    name: String(pouch.name || "").includes("Carton")
      ? String(pouch.name || "")
      : `${String(pouch.name || "").trim()} Carton`,
    subtitle: "Bulk Pack",
    badge: "Carton Deal",
    tagline: `Bulk buy (${cartonUnits} packs) and save.`,
    weight: `${cartonUnits} packs`,
    price: Math.round(Number(pouch.price || 0) * cartonUnits),
    price50: undefined,
    price100: Number(pouch.price || 0) > 0 ? Math.round(Number(pouch.price || 0) * cartonUnits) : undefined,
    stockQty: cartonStock,
    stockQty50: 0,
    stockQty100: 0,
    tags: Array.from(new Set([...(Array.isArray(pouch.tags) ? pouch.tags : []), "Carton"])),
  };
}

async function run() {
  const uri = readEnvValue("MONGODB_URI");
  if (!uri) throw new Error("MONGODB_URI missing in .env.local");
  const dbName = readEnvValue("MONGODB_DB", "cardinaltreats");
  const cartonUnits = Number(readEnvValue("CARTON_UNITS", "12")) || 12;

  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db(dbName).collection("products");
  const products = await col.find({}).toArray();

  let maxId = products.reduce((m, p) => Math.max(m, Number(p.id || 0)), 0);
  let maxSort = products.reduce((m, p) => Math.max(m, Number(p.sortOrder || 0)), 0);

  const toKeep = [];
  const cartByBase = new Map();
  const pouchRows = [];

  for (const p of products) {
    const slugBase = normalizeBaseSlug(p.slug || p.name || "");
    const isCarton =
      p.packType === "carton" ||
      String(p.weight || "").toLowerCase().includes("pack") ||
      String(p.slug || "").toLowerCase().endsWith("-carton") ||
      String(p.name || "").toLowerCase().includes("carton");

    if (isCarton) {
      const normalized = {
        ...p,
        packType: "carton",
        slug: String(p.slug || `${slugBase}-carton`),
      };
      toKeep.push(normalized);
      cartByBase.set(slugBase, true);
    } else {
      const normalized = { ...p, packType: "pouch" };
      toKeep.push(normalized);
      pouchRows.push(normalized);
    }
  }

  const additions = [];
  for (const pouch of pouchRows) {
    const base = normalizeBaseSlug(pouch.slug || pouch.name || "");
    if (cartByBase.has(base)) continue;
    maxId += 1;
    maxSort += 1;
    additions.push(makeCartonFromPouch(pouch, maxId, maxSort, cartonUnits));
    cartByBase.set(base, true);
  }

  const nextDocs = [...toKeep, ...additions].map(({ _id, ...rest }) => rest);
  await col.deleteMany({});
  if (nextDocs.length) await col.insertMany(nextDocs);

  console.log(
    JSON.stringify(
      {
        originalCount: products.length,
        pouchCount: nextDocs.filter((d) => d.packType === "pouch").length,
        cartonCount: nextDocs.filter((d) => d.packType === "carton").length,
        addedCartons: additions.length,
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
