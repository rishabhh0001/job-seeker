import { betterAuth } from "better-auth"
import { passkey } from "@better-auth/passkey"
import { Pool } from "pg"

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    plugins: [
        passkey({
            rpID: process.env.NODE_ENV === "production" ? "job.rishabhj.in" : "localhost",
            rpName: "JobPortal",
            origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        }),
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "applicant",
                input: true,
            },
        },
    },
})
