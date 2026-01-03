import { NextResponse } from "next/server"
import menuData from "@/data/menu.json"

export async function GET() {
  return NextResponse.json(menuData)
}
