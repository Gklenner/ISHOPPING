import { cookies } from "next/headers"
import prisma from './db/prisma'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { success: false, error: "Invalid credentials" }
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" }
    }

    const sessionId = uuidv4()
    const sessionData = {
      userId: user.id,
      sessionId,
      createdAt: new Date().toISOString()
    }

    // Set session cookie with enhanced security
    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    })

    const { password: _, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword as User }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // Password validation
    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long" }
    }

    // Enhanced password validation
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return {
        success: false,
        error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "user"
      }
    })

    const sessionId = uuidv4()
    const sessionData = {
      userId: user.id,
      sessionId,
      createdAt: new Date().toISOString()
    }

    // Set session cookie
    cookies().set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    })

    const { password: _, ...userWithoutPassword } = user
    return { success: true, user: userWithoutPassword as User }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "An error occurred during registration" }
  }
}

export async function logout(): Promise<void> {
  cookies().delete("session")
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = cookies().get("session")
    if (!session) return null

    const { userId } = JSON.parse(session.value)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return null

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}