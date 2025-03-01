import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {

  const { email } = await request.json()

  console.log(`Password recovery requested for email: ${email}`) // Log the email for debugging

  return NextResponse.json({ message: "Recovery email sent to " + email })
}
