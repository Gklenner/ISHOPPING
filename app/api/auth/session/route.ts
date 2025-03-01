import { getUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getUser()
  return NextResponse.json({ user })
}

