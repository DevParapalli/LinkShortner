// API client for making requests to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Types for API responses
export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

// Generic fetch function with authentication
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("token")

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "An error occurred",
      }
    }

    return {
      success: true,
      data: data.data || data,
    }
  } catch (error) {
    console.error("API request failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
    }
  }
}


// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchWithAuth<{ token: string; user: User, success:boolean }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  getCurrentUser: async () => {
    return fetchWithAuth<User>("/api/auth/me")
  },
}

// URLs API
export const urlsApi = {
  createUrl: async (data: CreateUrlRequest) => {
    return fetchWithAuth<Url>("/api/urls", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  getUserUrls: async () => {
    return fetchWithAuth<Url[]>("/api/urls")
  },

  deleteUrl: async (id: string) => {
    return fetchWithAuth<void>(`/api/urls/${id}`, {
      method: "DELETE",
    })
  },

  updateUrlStatus: async (id: string, active: boolean) => {
    return fetchWithAuth<Url>(`/api/urls/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    })
  },

  getUrlByShortCode: async (shortCode: string) => {
    return fetchWithAuth<{ originalUrl: string; urlId: string }>(`/${shortCode}`, {
      method: "GET",
      // No auth required for public redirect
      headers: {
        "Content-Type": "application/json",
      },
    })
  },

  recordClickEvent: async (urlId: string, clickData: Partial<ClickEvent>) => {
    return fetchWithAuth<{ success: boolean }>(`/api/analytics/click`, {
      method: "POST",
      body: JSON.stringify({ urlId, ...clickData }),
    })
  },
}

// Analytics API
export const analyticsApi = {
  getUrlAnalytics: async (urlId: string) => {
    return fetchWithAuth<UrlAnalytics>(`/api/analytics/url/${urlId}`)
  },

  getUserAnalytics: async () => {
    return fetchWithAuth<UserAnalytics>("/api/analytics/user")
  },
}

// Types based on the provided data models
export interface User {
  id: string
  email: string
  name?: string
}

export interface Url {
  id: string
  originalUrl: string
  shortCode: string
  customAlias?: string
  userId: string
  createdAt: string
  expiresAt?: string
  clicks: number
  active: boolean
}

export interface ClickEvent {
  id: string
  urlId: string
  timestamp: string
  ipAddress: string
  deviceType: string
  browser: string
  operatingSystem: string
  country: string
  city: string
  referrer: string
}

export interface CreateUrlRequest {
  originalUrl: string
  customAlias?: string
  expiresAt?: string
}

export interface UrlAnalytics {
  url: Url
  clickEvents: ClickEvent[]
  clicksByDate: { date: string; count: number }[]
  clicksByDevice: { deviceType: string; count: number }[]
  clicksByBrowser: { browser: string; count: number }[]
  clicksByOS: { operatingSystem: string; count: number }[]
  clicksByCountry: { country: string; count: number }[]
}

export interface UserAnalytics {
  totalUrls: number
  totalClicks: number
  clicksByDate: { date: string; count: number }[]
  topUrls: { url: Url; clicks: number }[]
}
