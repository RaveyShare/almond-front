import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    summaryText: "你最近放下了很多想法，我帮你慢慢整理着",
    signals: {
      createdCount7d: 12,
      activeGoals: 2,
      recentReviews: 3,
      busyHint: true,
    },
  })
}

