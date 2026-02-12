
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const result = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user'
        `
        return NextResponse.json({ columns: result })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
