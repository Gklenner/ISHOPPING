"use server"

import { cookies } from "next/headers"

type User = {
  id: string
  name: string
  email: string
}

export async function login(email: string, password: string): Promise<{ success: boolean; message: string }> {
  // Simulando uma chamada de API com delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulando validação de credenciais
  if (email === "demo@example.com" && password === "password") {
    const user: User = {
      id: "1",
      name: "Demo User",
      email: "demo@example.com",
    }

    // Armazenar sessão
    cookies().set("user", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    })

    return {
      success: true,
      message: "Login realizado com sucesso!",
    }
  }

  return {
    success: false,
    message: "Email ou senha inválidos",
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  // Simulando uma chamada de API com delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulando validação de email existente
  if (email === "demo@example.com") {
    return {
      success: false,
      message: "Este email já está em uso",
    }
  }

  // Simulando criação de usuário
  const user: User = {
    id: "2",
    name,
    email,
  }

  // Armazenar sessão
  cookies().set("user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
  })

  return {
    success: true,
    message: "Conta criada com sucesso!",
  }
}

export async function logout(): Promise<void> {
  cookies().delete("user")
}

export async function getUser(): Promise<User | null> {
  const userCookie = cookies().get("user")
  if (!userCookie) return null

  try {
    return JSON.parse(userCookie.value) as User
  } catch {
    return null
  }
}

