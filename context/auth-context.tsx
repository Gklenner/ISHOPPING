"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  register: (userData: User) => void
  recoverPassword: (email: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
  }

  const register = (userData: User) => {
    // Simulate registration logic
    setUser(userData)
  }

  const recoverPassword = (email: string) => {
    // Simulate password recovery logic
    console.log(`Recovery email sent to ${email}`)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, recoverPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
