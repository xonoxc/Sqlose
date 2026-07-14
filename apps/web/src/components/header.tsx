"use client"
import { cn } from "@/lib/utils"
import { Database } from "lucide-react"
import { Discord } from "@/components/ui/discord"
import { useScroll } from "@/hooks/use-scroll"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"

export const navLinks = [
   { label: "Docs", href: "https://github.com/xonoxc/Sqlose#readme" },
   { label: "Features", href: "#features" },
   { label: "Releases", href: "https://github.com/xonoxc/Sqlose/releases" },
]

export function Header() {
   const scrolled = useScroll(10)

   return (
      <header
         className={cn(
            "sticky top-0 z-50 mx-auto w-full max-w-5xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
            {
               "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-4xl md:shadow":
                  scrolled,
            }
         )}
      >
         <nav
            className={cn(
               "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
               {
                  "md:px-2": scrolled,
               }
            )}
         >
            <a
               className="rounded-md px-2 flex items-center gap-2 hover:bg-muted dark:hover:bg-muted/50"
               href="#"
            >
               <Database className="w-5 h-5" />
               <span className="font-semibold tracking-tight">Sqlose</span>
            </a>
            <div className="hidden items-center gap-2 md:flex">
               <div>
                  {navLinks.map(link => (
                     <Button asChild key={link.label} size="sm" variant="ghost">
                        <a href={link.href}>{link.label}</a>
                     </Button>
                  ))}
               </div>
               <Button size="sm" variant="outline" asChild>
                  <a href="https://github.com/xonoxc/Sqlose" target="_blank" rel="noreferrer">
                     <Discord className="size-4" />
                  </a>
               </Button>
               <Button size="sm" style={{ backgroundColor: "oklch(72.3% 0.219 149.579)" }} asChild>
                  <a href="https://github.com/xonoxc/Sqlose/releases" target="_blank" rel="noreferrer">
                     Get App
                  </a>
               </Button>
            </div>
            <MobileNav />
         </nav>
      </header>
   )
}
