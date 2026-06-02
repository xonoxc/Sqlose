import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"
import { GitHub } from "@/components/ui/githubsvg"
import { DecorIcon } from "@/components/decor-icon"
import { FullWidthDivider } from "@/components/full-width-divider"

export function HeroSection() {
   return (
      <section className="relative">
         <div className="relative flex flex-col items-center justify-center gap-5 px-4 py-12 md:px-4 md:py-24 lg:py-28">
            <DecorIcon className="size-4" position="bottom-left" />
            <DecorIcon className="size-4" position="bottom-right" />
            <FullWidthDivider position="bottom" />

            {/* X Faded Borders & Shades */}
            <div aria-hidden="true" className="absolute inset-0 -z-1 size-full overflow-hidden">
               <div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
               <div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
               <div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
               <div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
            </div>
            <a
               className={cn(
                  "group mx-auto flex w-fit items-center gap-3 rounded-sm border bg-card p-1 shadow",
                  "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
               )}
               href="#link"
            >
               <div className="rounded-xs border bg-card px-1.5 py-0.5 shadow-sm">
                  <p className="font-mono text-xs">NOW</p>
               </div>

               <span className="text-xs flex items-center gap-1">
                  <GitHub className="w-3.5 h-3.5" />
                  v1.0.0 · Latest
               </span>
               <span className="block h-5 border-l" />

               <div className="pr-1">
                  <ArrowRightIcon className="size-3 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0.5" />
               </div>
            </a>

            <h1
               className={cn(
                  "max-w-2xl text-balance text-center text-3xl text-foreground md:text-5xl lg:text-6xl",
                  "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out"
               )}
            >
               Ephemeral SQL Environments <br className="hidden md:block" />
               Now{" "}
               <span className="bg-linear-to-r from-[oklch(62.3%_0.214_259.815)] to-[oklch(62.3%_0.214_259.815/.6)] bg-clip-text text-transparent">
                  Open Source
               </span>
            </h1>

            <p
               className={cn(
                  "text-center text-muted-foreground text-sm tracking-wider sm:text-lg",
                  "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out"
               )}
            >
               Use SQLose to spin up fully isolated databases in minutes, or self-host it on your
               own infrastructure. Zero leftover clutter.
            </p>

            <div className="fade-in slide-in-from-bottom-10 flex w-fit animate-in items-center justify-center gap-3 fill-mode-backwards pt-2 delay-300 duration-500 ease-out">
               <Button variant="outline" asChild>
                  <a href="https://github.com/xonoxc/Sqlose" target="_blank" rel="noreferrer">
                     <GitHub className="size-4" />
                     GitHub
                  </a>
               </Button>
               <Button style={{ backgroundColor: "oklch(72.3% 0.219 149.579)" }}>
                  Get app <ArrowRightIcon data-icon="inline-end" />
               </Button>
            </div>
         </div>
      </section>
   )
}
