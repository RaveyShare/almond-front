import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hints: [
      { id: "hint_01", text: "我发现有几颗杏仁其实可以合并", relatedIds: ["alm_201", "alm_202"], severity: "low" },
      { id: "hint_02", text: "要不要把这个想法拆成更小的杏仁？", relatedIds: ["alm_501"], severity: "low" },
    ],
  })
}

