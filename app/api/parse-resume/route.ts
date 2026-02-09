import { NextRequest, NextResponse } from "next/server"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (fileType === "json") {
      // Handle JSON resume
      const text = await file.text()
      try {
        const jsonData = JSON.parse(text)
        return NextResponse.json({
          success: true,
          type: "json",
          data: jsonData,
          text: JSON.stringify(jsonData, null, 2),
        })
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        )
      }
    } else if (fileType === "pdf") {
      // Handle PDF resume
      // For client-side PDF parsing, we'll return instructions
      // The actual PDF parsing happens in the component
      const buffer = await file.arrayBuffer()
      return NextResponse.json({
        success: true,
        type: "pdf",
        message: "PDF received. Parse on client side.",
        size: buffer.byteLength,
      })
    } else if (fileType === "text") {
      // Handle plain text resume
      const text = await file.text()
      return NextResponse.json({
        success: true,
        type: "text",
        text: text,
      })
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("[v0] Resume parsing error:", error)
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    )
  }
}
