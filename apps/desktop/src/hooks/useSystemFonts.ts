import { useCallback, useState } from "react"
import { attempt } from "@sqlose/shared"
import { api } from "~/lib/api"

export const FALLBACK_MONOSPACE_FONTS: string[] = [
   "Geist Mono",
   "JetBrains Mono",
   "Fira Code",
   "Hack",
   "Menlo",
   "Monaco",
   "Consolas",
   "DejaVu Sans Mono",
   "Ubuntu Mono",
   "Source Code Pro",
   "Courier New",
]

export function useSystemFonts() {
   const [fonts, setFonts] = useState<string[]>([])
   const [loading, setLoading] = useState(false)
   const [available, setAvailable] = useState(true)

   const applySystemFonts = useCallback((list: string[]) => {
      const clean = list.map(font => font.replace(/^"|"$/g, "").trim()).filter(Boolean)
      console.log("applySystemFonts:", clean.length)
      setFonts(Array.from(new Set(clean)).sort((a, b) => a.localeCompare(b)))
      setAvailable(true)
   }, [])

   const applyFallback = useCallback(() => {
      setFonts(FALLBACK_MONOSPACE_FONTS)
      setAvailable(false)
   }, [])

   const refresh = useCallback(async () => {
      setLoading(true)
      const result = await attempt(api.fonts.list())
      console.log("refresh result:", result.toString())
      result.match(inner => {
         console.log("inner:", inner.toString())
         inner.match(applySystemFonts, applyFallback)
      }, applyFallback)
      setLoading(false)
   }, [applySystemFonts, applyFallback])

   return { fonts, loading, available, refresh }
}
