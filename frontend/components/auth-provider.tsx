"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { type User, authApi } from "@/lib/api-client"

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Load user from token on initial load
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem("token")

      if (storedToken) {
        setToken(storedToken)
        try {
          const response = await authApi.getCurrentUser()
          if (response.success && response.data) {
            setUser(response.data)
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("token")
            setToken(null)
          }
        } catch (error) {
          console.error("Failed to load user:", error)
          localStorage.removeItem("token")
          setToken(null)
        }
      }

      setIsLoading(false)
    }

    loadUser()
  }, [])

  // Handle redirects based on auth state
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ["/auth/login", "/"]
      const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith("/DP")

      if (!token && !isPublicPath) {
        router.push("/auth/login")
      } else if (token && pathname === "/auth/login") {
        router.push("/dashboard")
      }
    }
  }, [token, pathname, isLoading, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await authApi.login(email, password)
      console.log("Login response:", response)
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data

        // Store token in localStorage
        localStorage.setItem("token", newToken)

        setToken(newToken)
        setUser(userData)

        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        router.push("/dashboard")
        return true
      } else {
        toast({
          title: "Login failed",
          description: response.message || "Please check your credentials and try again.",
          variant: "destructive",
        })
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    router.push("/auth/login")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
