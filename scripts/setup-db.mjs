import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found. Make sure .env.local has it set.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

const withoutComments = schema
  .split("\n")
  .map((line) => line.replace(/--.*$/, ""))
  .join("\n");

const statements = withoutComments
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const statement of statements) {
  console.log("Running:", statement.slice(0, 60).replace(/\n/g, " ") + "...");
  await sql.query(statement);
}

console.log("\n✅ Schema applied successfully.");
