import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password } = await request.json()

  // Simulate user authentication
  const user = { id: "1", name: "John Doe", email } // Simulated user data

  return NextResponse.json({ user })
}
