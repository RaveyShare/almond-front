import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    items: [
      {
        id: "alm_201",
        title: "项目X的想法草稿",
        type: "unknown",
        cardType: "growing",
        reason: "近期多次修改，尚未定型",
        updatedAt: new Date().toISOString(),
      },
      {
        id: "alm_301",
        title: "线性代数公式",
        type: "memory",
        cardType: "review",
        nextReviewAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        reason: "到达轻提示复习窗口",
      },
      {
        id: "alm_401",
        title: "周报撰写",
        type: "action",
        cardType: "near-done",
        progress: 0.8,
        dueAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        reason: "进度接近完成",
      },
      {
        id: "alm_501",
        title: "英语词汇量提升",
        type: "goal",
        cardType: "goal-progress",
        progress: 0.3,
        reason: "子杏仁近期有推进",
      },
    ],
  })
}

