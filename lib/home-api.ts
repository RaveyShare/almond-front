import { authManager } from "./auth"

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK ? process.env.NEXT_PUBLIC_USE_MOCK === "true" : true

const base = (path: string) => {
  if (USE_MOCK) return `/api${path}`
  return `/front${path}`
}

async function req<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`http ${res.status}`)
  return res.json() as Promise<T>
}

export type HomeSummary = {
  summaryText: string
  signals: {
    createdCount7d: number
    activeGoals: number
    recentReviews: number
    busyHint: boolean
  }
}

export type HomeDynamicItem = {
  id: string
  title: string
  type: "memory" | "action" | "goal" | "unknown"
  cardType: "growing" | "review" | "near-done" | "goal-progress"
  reason?: string
  updatedAt?: string
  nextReviewAt?: string | null
  progress?: number
  dueAt?: string | null
}

export type Hint = {
  id: string
  text: string
  relatedIds: string[]
  severity: "low"
  dismissed?: boolean
}

export type RecentItem = {
  id: string
  title: string
  excerpt?: string
  lastTouchedAt: string
}

export async function getHomeSummary(): Promise<HomeSummary> {
  return req<HomeSummary>(base("/home/summary"))
}

export async function getHomeDynamic(limit = 5): Promise<{ items: HomeDynamicItem[] }> {
  return req<{ items: HomeDynamicItem[] }>(`${base("/home/dynamic")}?limit=${limit}`)
}

export async function getHomeHints(): Promise<{ hints: Hint[] }> {
  return req<{ hints: Hint[] }>(base("/home/hints"))
}

export async function dismissHint(hintId: string): Promise<{ dismissed: boolean }> {
  return req<{ dismissed: boolean }>(base(`/home/hints/${hintId}/dismiss`), { method: "POST" })
}

export async function getHomeRecent(limit = 5): Promise<{ items: RecentItem[] }> {
  return req<{ items: RecentItem[] }>(`${base("/home/recent")}?limit=${limit}`)
}

export async function createAlmond(payload: { title: string; content?: string; tags?: string[] }) {
  const token = authManager.getToken()
  const res = await fetch(base("/almonds"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`http ${res.status}`)
  return res.json()
}
