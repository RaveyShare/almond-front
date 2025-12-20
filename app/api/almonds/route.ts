import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  return NextResponse.json({
    id: `alm_${Date.now()}`,
    status: "new",
    type: "unknown",
    createdAt: new Date().toISOString(),
    title: body?.title || "未命名",
    content: body?.content || "",
    tags: Array.isArray(body?.tags) ? body.tags : [],
  })
}

