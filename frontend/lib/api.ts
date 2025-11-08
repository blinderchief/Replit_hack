/**
 * API utility functions for making requests to the backend
 * Uses relative paths that are proxied by Next.js rewrites
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Get the API URL for a given path
 * In development, this uses Next.js rewrites to proxy to localhost:8000
 * In production, set NEXT_PUBLIC_API_URL to your backend URL
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // If API_BASE is set, use it; otherwise use relative path for Next.js proxy
  return API_BASE ? `${API_BASE}${cleanPath}` : cleanPath
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 */
export async function apiFetch(path: string, options?: RequestInit) {
  const url = getApiUrl(path)
  return fetch(url, options)
}
