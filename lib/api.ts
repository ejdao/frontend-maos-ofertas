import type { ApiResponse } from "./types"

const API_URL = "https://eklipse.grupoclinicamedicos.com:8106/v1/inn/maos/fetch-data"

export async function fetchData(): Promise<ApiResponse> {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`)
  }

  return response.json()
}
