import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    items: [
      { id: "alm_201", title: "项目X的想法草稿", excerpt: "……", lastTouchedAt: new Date().toISOString() },
      { id: "alm_401", title: "周报撰写", excerpt: "……", lastTouchedAt: new Date(Date.now() - 3600 * 1000).toISOString() },
      { id: "alm_301", title: "线性代数公式", excerpt: "……", lastTouchedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
    ],
  })
}

