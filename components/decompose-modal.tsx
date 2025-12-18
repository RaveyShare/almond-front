"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, Circle } from "lucide-react"
import { toast } from "sonner"
import type { DecomposeResult } from "@/lib/types"

interface DecomposeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    taskId: string
    taskTitle: string
    onDecomposed?: (result: DecomposeResult) => void
}

export default function DecomposeModal({ open, onOpenChange, taskId, taskTitle, onDecomposed }: DecomposeModalProps) {
    const [result, setResult] = useState<DecomposeResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleDecompose = async () => {
        try {
            setIsLoading(true)
            // 在这里调用 api.tasks.decompose
            // 注意：实际项目中这里应该是通过 props 传入 api 或者直接导入
            const { api } = await import("@/lib/api-config")
            const jsonStr = await api.tasks.decompose(taskId)
            const data = JSON.parse(jsonStr) as DecomposeResult
            setResult(data)
            if (onDecomposed) onDecomposed(data)
            toast.success("任务拆解成功")
        } catch (error) {
            console.error("Decompose error:", error)
            toast.error("拆解失败，请重试")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-black border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl text-cyan-400">AI 任务拆解</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-white/5 p-4 border border-white/10">
                        <h3 className="text-sm font-medium text-white/50 mb-1">正在拆解任务：</h3>
                        <p className="text-lg font-semibold">{taskTitle}</p>
                    </div>

                    {!result && !isLoading && (
                        <div className="flex justify-center py-8">
                            <Button
                                onClick={handleDecompose}
                                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-8 rounded-full"
                            >
                                开始拆解
                            </Button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                            <p className="text-white/70 animate-pulse">AI 正在思考如何拆解...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <h4 className="text-sm font-medium text-cyan-400">建议子任务：</h4>
                            {result.subtasks.map((sub, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                                    <div className="mt-1">
                                        <Circle className="h-4 w-4 text-cyan-400/50" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{sub.title}</p>
                                        {sub.description && <p className="text-sm text-white/50">{sub.description}</p>}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    className="bg-white/10 hover:bg-white/20 text-white rounded-full"
                                >
                                    完成查看
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
