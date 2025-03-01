import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {

  const { name, email, password } = await request.json()

  // Simulate user registration
  const user = { id: "1", name, email } // Simulated user data


  return NextResponse.json({ user })
}
