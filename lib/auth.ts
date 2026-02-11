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
                input: true, // Allow this field to be set during sign up
            },
            firstName: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
            lastName: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
            companyName: {
                type: "string",
                required: false,
                defaultValue: "",
                input: true,
            },
            // Extended Profile Fields
            phone: {
                type: "string",
                required: false,
            },
            dateOfBirth: {
                type: "string", // Storing as string or use date type
                required: false,
            },
            address: {
                type: "string",
                required: false,
            },
            city: {
                type: "string",
                required: false,
            },
            state: {
                type: "string",
                required: false,
            },
            country: {
                type: "string",
                required: false,
            },
            postalCode: {
                type: "string",
                required: false,
            },
            // Education
            highestQualification: {
                type: "string",
                required: false,
            },
            collegeName: {
                type: "string",
                required: false,
            },
            major: {
                type: "string",
                required: false,
            },
            graduationYear: {
                type: "number",
                required: false,
            },
            gpa: {
                type: "number",
                required: false,
            },
            // Professional
            yearsOfExperience: {
                type: "number",
                required: false,
            },
            currentJobTitle: {
                type: "string",
                required: false,
            },
            linkedin: {
                type: "string",
                required: false,
            },
            portfolio: {
                type: "string",
                required: false,
            },
            skills: {
                type: "string", // Stored as comma-separated or JSON string
                required: false,
            },
        },
    },
})
