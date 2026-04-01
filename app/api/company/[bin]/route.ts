import { getCompanyIntelligence } from "@/lib/demo-data"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: { bin: string } }
) {
  try {
    const { bin } = await params

    if (!bin || bin.length !== 12 || !/^\d+$/.test(bin)) {
      return NextResponse.json(
        { error: "Invalid BIN format. Must be 12 digits." },
        { status: 400 }
      )
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const data = getCompanyIntelligence(bin)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Company API Error]:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
