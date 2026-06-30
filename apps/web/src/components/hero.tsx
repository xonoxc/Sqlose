import Image from "next/image"
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
            <a
               className={cn(
                  "group mx-auto flex w-fit items-center gap-3 rounded-sm border border-neutral-50/10 bg-card p-1 shadow",
                  "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
               )}
               href="https://github.com/xonoxc/Sqlose/releases"
            >
               <span className="block h-5" />

               <GitHub className="w-3.5 h-3.5" />
               <span className="text-xs flex items-center gap-2 text-shadow-accent">
                  v0.1.5 · Latest
               </span>
               <span className="block h-5 border-l border-neutral-500/40" />

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
               Now
               <span className="bg-linear-to-r from-blue-500 to- bg-clip-text text-transparent">
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
               <Button style={{ backgroundColor: "oklch(72.3% 0.219 149.579)" }} asChild>
                  <a href="https://github.com/xonoxc/Sqlose/releases" target="_blank" rel="noreferrer">
                     Get app <ArrowRightIcon data-icon="inline-end" />
                  </a>
               </Button>
            </div>

            <FullWidthDivider position="top" />
            {/* Dashboard Preview Container */}
            <div className="relative">
               <div className="relative overflow-hidden rounded-sm border-white/5 bg-zinc-950/50 flex border-3 p-2">
                  <div
                     className={cn(
                        "pointer-events-none",
                        "absolute inset-y-0 right-0 hidden sm:block",
                        "z-10",
                        "translate-x-14",
                        "h-full w-10 sm:w-14",
                        "border-l border-[rgba(255,255,255,0.1)]",
                        "bg-[repeating-linear-gradient(230deg,rgba(255,255,255,0.1)_0px,rgba(255,255,255,0.1)_1px,transparent_1px,transparent_10px)]"
                     )}
                  />
                  <div className=" overflow-hidden rounded-sm border-white/5 bg-zinc-950/50 flex border-2">
                     <Image
                        src="/ss.png"
                        height={400}
                        width={1200}
                        alt="Sqlose Dashboard Preview"
                        className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.01]"
                     />
                  </div>
               </div>
            </div>

            {/* Bottom Dividers moved below screenshot */}
            <DecorIcon className="size-4" position="bottom-left" />
            <DecorIcon className="size-4" position="bottom-right" />
            <FullWidthDivider position="bottom" />
         </div>
      </section>
   )
}
