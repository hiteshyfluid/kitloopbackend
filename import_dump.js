require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DUMP_PATH = path.join(__dirname, 'Kitloop_database.sql');

const TABLE_ORDER = [
  'sports',
  'sub_categories',
  'brands',
  'users',
  'listings',
  'offers',
  'messages',
  'counter_offers',
  'orders',
  'payments',
  'disputes',
  'reviews',
  'favourites',
  'notifications',
  'seller_badges',
  'sessions',
  'shares',
  'site_settings',
  'fee_config',
  'audit_log',
];

function unescapeCopyField(raw) {
  if (raw === '\\N') return null;
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '\\' && i + 1 < raw.length) {
      const next = raw[i + 1];
      if (next === 't') { out += '\t'; i++; continue; }
      if (next === 'n') { out += '\n'; i++; continue; }
      if (next === 'r') { out += '\r'; i++; continue; }
      if (next === '\\') { out += '\\'; i++; continue; }
      if (next === 'b') { out += '\b'; i++; continue; }
      if (next === 'f') { out += '\f'; i++; continue; }
      if (next === 'v') { out += '\v'; i++; continue; }
      out += next;
      i++;
      continue;
    }
    out += c;
  }
  return out;
}

function parseDump(text) {
  const blocks = {};
  const re = /^COPY public\.(\w+) \(([^)]+)\) FROM stdin;\n([\s\S]*?)^\\\.$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const table = m[1];
    const columns = m[2].split(',').map((c) => c.trim());
    let dataText = m[3];
    dataText = dataText.replace(/\n$/, '');
    const lines = dataText.length > 0 ? dataText.split('\n') : [];
    const rows = lines.map((line) => line.split('\t').map(unescapeCopyField));
    blocks[table] = { columns, rows };
  }
  return blocks;
}

async function main() {
  const text = fs.readFileSync(DUMP_PATH, 'utf8');
  const blocks = parseDump(text);

  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();

  try {
    await client.query('BEGIN');

    for (const table of TABLE_ORDER) {
      const block = blocks[table];
      if (!block || block.rows.length === 0) {
        console.log(`  (skip) ${table} — no rows in dump`);
        continue;
      }

      const { columns, rows } = block;
      const colList = columns.map((c) => `"${c}"`).join(', ');

      let inserted = 0;
      for (const row of rows) {
        const placeholders = row.map((_, idx) => `$${idx + 1}`).join(', ');
        const sql = `INSERT INTO public.${table} (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        await client.query(sql, row);
        inserted++;
      }
      console.log(`  ✓ ${table}: ${inserted} row(s) inserted`);
    }

    await client.query('COMMIT');
    console.log('\nImport complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\nImport failed, rolled back:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
