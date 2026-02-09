const { neon } = require("@neondatabase/serverless")
require("dotenv").config()

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log("Creating/updating Better Auth tables...\n")

  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT,
      role TEXT DEFAULT 'applicant',
      "firstName" TEXT DEFAULT '',
      "lastName" TEXT DEFAULT '',
      "companyName" TEXT DEFAULT '',
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
  console.log("  ✓ user table")

  // Add new columns if they don't exist (safe for re-runs)
  const newCols = [
    { name: "firstName", type: "TEXT DEFAULT ''" },
    { name: "lastName", type: "TEXT DEFAULT ''" },
    { name: "companyName", type: "TEXT DEFAULT ''" },
  ]
  for (const col of newCols) {
    try {
      await sql(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`)
      console.log(`  ✓ column "${col.name}" ensured`)
    } catch (e) {
      // column already exists
    }
  }

  await sql`
    CREATE TABLE IF NOT EXISTS "session" (
      id TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      token TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    )
  `
  console.log("  ✓ session table")

  await sql`
    CREATE TABLE IF NOT EXISTS "account" (
      id TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP,
      "refreshTokenExpiresAt" TIMESTAMP,
      scope TEXT,
      password TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `
  console.log("  ✓ account table")

  await sql`
    CREATE TABLE IF NOT EXISTS "verification" (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP,
      "updatedAt" TIMESTAMP
    )
  `
  console.log("  ✓ verification table")

  await sql`
    CREATE TABLE IF NOT EXISTS "passkey" (
      id TEXT PRIMARY KEY,
      name TEXT,
      "publicKey" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "webauthnUserID" TEXT NOT NULL,
      counter INTEGER NOT NULL DEFAULT 0,
      "deviceType" TEXT NOT NULL,
      "backedUp" BOOLEAN NOT NULL DEFAULT FALSE,
      transports TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  console.log("  ✓ passkey table")

  console.log("\n✅ All tables created/updated successfully!")
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
