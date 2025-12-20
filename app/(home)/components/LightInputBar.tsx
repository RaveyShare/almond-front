"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createAlmond } from "@/lib/home-api"
import { toast } from "sonner"

const PLACEHOLDERS = [
  "「刚想到的一件事」",
  "「一个模糊的想法」",
  "「最近反复出现的念头」",
  "「今天发生的一件事」",
]

export default function LightInputBar({ disabled }: { disabled?: boolean }) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [pi, setPi] = useState(0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || disabled) return
    setLoading(true)
    const content = value
    setValue("")
    try {
      await createAlmond({ title: content.slice(0, 50), content })
      toast("我记住了 🌰")
    } catch {
      setValue(content)
      toast("保存失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-3 px-4">
      <div className="relative flex-1 h-12">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading || disabled}
          className="h-12 rounded-full border-white/20 bg-white/10 px-5 text-white placeholder:text-transparent pr-12"
        />
        {!value && (
          <div className="absolute inset-0 px-5 flex items-center pointer-events-none">
            <span className="text-white/50 truncate">{PLACEHOLDERS[pi]}</span>
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={loading || disabled}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 text-black"
      >
        {loading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.3"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4"/></svg>
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        )}
      </Button>
    </form>
  )
}

