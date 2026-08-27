import { useState } from "react"
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
   const [loading, setLoading] = useState<boolean>(false)
   const [available, setAvailable] = useState<boolean>(true)

   const applySystemFonts = (list: string[]) => {
      setFonts(
         Array.from(
            new Set(
               list
                  .map(font => {
                     return font.replace(/^"|"$/g, "").trim()
                  })
                  .filter(Boolean)
            )
         ).sort((a, b) => a.localeCompare(b))
      )
      setAvailable(true)
   }

   const applyFallback = () => {
      setFonts(FALLBACK_MONOSPACE_FONTS)
      setAvailable(false)
   }

   const refresh = async () => {
      setLoading(true)

      const result = await attempt(api.fonts.list())
      if (result.isErr()) {
         applyFallback()
         return
      }
      const inner = result.value

      console.log("inner:", inner.toString())
      inner.match(applySystemFonts, applyFallback)

      setLoading(false)
   }

   return {
      fonts,
      loading,
      available,
      refresh,
   }
}
