import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const fileType = formData.get("fileType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (fileType === "json") {
      const text = await file.text()
      try {
        const jsonData = JSON.parse(text)
        return NextResponse.json({
          success: true,
          type: "json",
          data: jsonData,
          text: JSON.stringify(jsonData, null, 2),
        })
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        )
      }
    } else if (fileType === "text" || fileType === "pdf") {
      const text = await file.text()
      return NextResponse.json({
        success: true,
        type: fileType,
        text,
      })
    } else {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Resume parsing error:", error)
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    )
  }
}
