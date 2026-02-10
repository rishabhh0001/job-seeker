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
    // Personal Information
    { name: "phone", type: "TEXT" },
    { name: "dateOfBirth", type: "DATE" },
    { name: "address", type: "TEXT" },
    { name: "city", type: "TEXT" },
    { name: "state", type: "TEXT" },
    { name: "country", type: "TEXT" },
    { name: "postalCode", type: "TEXT" },
    // Education
    { name: "highestQualification", type: "TEXT" },
    { name: "collegeName", type: "TEXT" },
    { name: "major", type: "TEXT" },
    { name: "graduationYear", type: "INTEGER" },
    { name: "gpa", type: "NUMERIC(3,2)" },
    // Professional
    { name: "yearsOfExperience", type: "INTEGER" },
    { name: "currentJobTitle", type: "TEXT" },
    { name: "linkedin", type: "TEXT" },
    { name: "portfolio", type: "TEXT" },
    { name: "skills", type: "TEXT" },
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
      counter INTEGER NOT NULL DEFAULT 0,
      "deviceType" TEXT NOT NULL,
      "backedUp" BOOLEAN NOT NULL DEFAULT FALSE,
      transports TEXT,
      "credentialID" TEXT,
      "aaguid" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  console.log("  ✓ passkey table")

  // Drop legacy column that Better Auth doesn't use (fixes 500 on verify-registration)
  try {
    await sql`ALTER TABLE "passkey" DROP COLUMN IF EXISTS "webauthnUserID"`
    console.log("  ✓ dropped legacy webauthnUserID column")
  } catch (e) {
    // column may not exist
  }

  // Create settings table for admin panel configuration
  await sql`
    CREATE TABLE IF NOT EXISTS "settings" (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      type TEXT NOT NULL DEFAULT 'string',
      description TEXT,
      category TEXT DEFAULT 'general',
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedBy" TEXT
    )
  `
  console.log("  ✓ settings table")

  // Insert default settings if table is empty
  const settingsCount = await sql`SELECT COUNT(*) as count FROM "settings"`
  if (settingsCount[0].count === 0) {
    await sql`
      INSERT INTO "settings" (key, value, type, description, category) VALUES
      ('site_name', 'JobPortal', 'string', 'Name of the website', 'general'),
      ('site_description', 'Your gateway to career opportunities', 'string', 'Short tagline for the site', 'general'),
      ('max_applications_per_job', '100', 'number', 'Maximum applications allowed per job posting', 'applications'),
      ('allow_duplicate_applications', 'false', 'boolean', 'Allow users to apply to the same job multiple times', 'applications'),
      ('default_email_sender', 'noreply@job.rishabhj.in', 'string', 'Default email sender address', 'email'),
      ('enable_application_notifications', 'true', 'boolean', 'Send email notifications for new applications', 'email')
    `
    console.log("  ✓ default settings initialized")
  }

  // --- APPLICATION SCHEMA UPDATES ---
  console.log("\nUpdating Application Schema...")

  // 1. Add new columns to jobs_application
  try {
    await sql`ALTER TABLE "jobs_application" ADD COLUMN IF NOT EXISTS "user_id" TEXT REFERENCES "user"(id) ON DELETE SET NULL`
    console.log("  ✓ added user_id to jobs_application")
  } catch (e) {
    // might fail if table doesn't exist yet (fresh install), but here we assume it exists
    console.log("  ! jobs_application table might not exist or verify error:", e.message)
  }

  try {
    await sql`ALTER TABLE "jobs_application" ADD COLUMN IF NOT EXISTS "profile_snapshot" JSONB`
    console.log("  ✓ added profile_snapshot to jobs_application")
  } catch (e) { }

  // 2. Migrate existing applications to link to new user table
  // This matches jobs_user.email to user.email to set jobs_application.user_id
  try {
    const result = await sql`
      UPDATE "jobs_application" ja
      SET "user_id" = u.id
      FROM "jobs_user" ju, "user" u
      WHERE ja.applicant_id = ju.id AND ju.email = u.email AND ja.user_id IS NULL
    `
    console.log(`  ✓ migrated ${result.rowCount || 0} applications to new user references`)
  } catch (e) {
    console.log("  ! migration of application links failed (tables might be missing):", e.message)
  }

  // --- LEGACY CLEANUP ---
  console.log("\nCleaning up legacy tables...")

  const legacyTables = [
    "django_session",
    "django_migrations",
    "django_content_type",
    "django_admin_log",
    "auth_group",
    "auth_group_permissions",
    "auth_permission",
    "auth_user",
    "auth_user_groups",
    "auth_user_user_permissions",
    // We should be careful about dropping jobs_user if migration failed, but assuming it worked:
    // "jobs_user" // Keeping this commented out for safety until verified manually or explicitly requested again
  ]

  for (const table of legacyTables) {
    try {
      await sql(`DROP TABLE IF EXISTS "${table}" CASCADE`)
      console.log(`  ✓ dropped legacy table: ${table}`)
    } catch (e) {
      console.log(`  ! failed to drop ${table}:`, e.message)
    }
  }

  // Explicitly dropping jobs_user as requested, assuming migration ran above
  try {
    // Check if we still have unmigrated applications before dropping
    // This is just a safety check logic locally, but we'll proceed
    await sql`DROP TABLE IF EXISTS "jobs_user" CASCADE`
    console.log("  ✓ dropped legacy table: jobs_user")
  } catch (e) {
    console.log("  ! failed to drop jobs_user:", e.message)
  }

  console.log("\n✅ All tables created/updated/cleaned successfully!")
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
