"use client"

import { captureError } from "@/lib/error-tracking"

interface FetchOptions extends RequestInit {
  timeout?: number
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message)
    this.name = "APIError"
  }
}

async function fetchWithTimeout(resource: RequestInfo, options: FetchOptions = {}) {
  const { timeout = 8000, ...fetchOptions } = options

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new APIError(response.statusText, response.status, data)
    }

    return response
  } finally {
    clearTimeout(id)
  }
}

export async function apiClient<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { headers, ...fetchOptions } = options

  try {
    const response = await fetchWithTimeout(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...fetchOptions,
    })

    return await response.json()
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new APIError("Request timeout", 408)
      }

      captureError(error)
      throw new APIError("Network error", 500)
    }

    throw new APIError("Unknown error", 500)
  }
}

