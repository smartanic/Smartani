import dotenv from "dotenv";
import assert from "assert";
import { Database } from "../../src/database/db";

dotenv.config();

describe("test get connection", () => {
  const db: Database = new Database(
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    process.env.DB_HOST!,
    process.env.DB_PORT!,
    process.env.DB_NAME!,
    process.env.DB_DIALECT!
  );
  it("connect success", async () => {
    await db.connect();
    assert.notEqual(db.getConnection(), null);
  });
});

