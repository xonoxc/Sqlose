import { cn } from "@/lib/utils"
import { DecorIcon } from "@/components/decor-icon"
import { FullWidthDivider } from "@/components/full-width-divider"
import {
   DatabaseIcon,
   ZapIcon,
   ShieldCheckIcon,
   CodeIcon,
   CloudIcon,
   TimerIcon,
} from "lucide-react"

const features = [
   {
      icon: DatabaseIcon,
      title: "Ephemeral Databases",
      description:
         "Spin up fully isolated SQL environments in seconds. Each session gets its own sandbox — no shared state, no leftover clutter.",
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-400",
   },
   {
      icon: ZapIcon,
      title: "Blazing Fast Queries",
      description:
         "Execute SQL queries with near-instant feedback. Our optimized engine delivers results in milliseconds, even on complex joins.",
      gradient: "from-amber-500/20 to-amber-500/5",
      iconColor: "text-amber-400",
   },
   {
      icon: ShieldCheckIcon,
      title: "Secure by Default",
      description:
         "Every environment is sandboxed and isolated. Your data never leaks between sessions, with zero-trust architecture baked in.",
      gradient: "from-sky-500/20 to-sky-500/5",
      iconColor: "text-sky-400",
   },
   {
      icon: CodeIcon,
      title: "Multi-Dialect Support",
      description:
         "Write queries in PostgreSQL, SQLite, or MySQL syntax. Switch between dialects seamlessly without changing your workflow.",
      gradient: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-400",
   },
   {
      icon: CloudIcon,
      title: "Self-Hostable",
      description:
         "Deploy Sqlose on your own infrastructure with a single command. Full control over your data, compliance, and uptime.",
      gradient: "from-rose-500/20 to-rose-500/5",
      iconColor: "text-rose-400",
   },
   {
      icon: TimerIcon,
      title: "Auto-Expiring Sessions",
      description:
         "Set TTLs on environments and let them clean up automatically. Perfect for CI pipelines, demos, and ephemeral testing.",
      gradient: "from-teal-500/20 to-teal-500/5",
      iconColor: "text-teal-400",
   },
]

export function FeaturesSection() {
   return (
      <section className="relative pb-12 md:pb-16">
         {/* Section header */}
         <div className="text-center">
            <h2 className="py-6 font-medium text-lg text-muted-foreground tracking-tight md:text-xl">
               What the <span className="text-foreground">use</span>
            </h2>
         </div>

         {/* Feature grid */}
         <div className="relative">
            <DecorIcon className="size-4" position="top-left" />
            <DecorIcon className="size-4" position="top-right" />
            <DecorIcon className="size-4" position="bottom-left" />
            <DecorIcon className="size-4" position="bottom-right" />

            <FullWidthDivider className="-top-px" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
               {features.map((feature, index) => (
                  <div
                     key={feature.title}
                     className={cn(
                        "group relative flex flex-col gap-4 p-6 md:p-8",
                        "transition-colors duration-300 hover:bg-card/60",
                        // Base / Mobile borders (single column list: horizontal dividers only)
                        "border-b border-border last:border-b-0",
                        // Tablet borders (2 columns: vertical line between col 0 and 1, horizontal dividers)
                        index % 2 === 0 && "md:border-r md:border-border",
                        index === 4 && "md:border-b-0",
                        // Desktop borders (3 columns: reset tablet right, add two vertical dividers)
                        "lg:border-r-0",
                        index % 3 === 1 && "lg:border-x lg:border-border",
                        index >= 3 && "lg:border-b-0"
                     )}
                  >
                     {/* Gradient glow on hover */}
                     <div
                        aria-hidden="true"
                        className={cn(
                           "absolute inset-0 -z-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                           `bg-gradient-to-br ${feature.gradient}`
                        )}
                     />

                     {/* Icon */}
                     <div
                        className={cn(
                           "flex size-10 items-center justify-center",
                           "transition-transform duration-300 group-hover:scale-110"
                        )}
                     >
                        <feature.icon className={cn("size-5", feature.iconColor)} />
                     </div>

                     {/* Content */}
                     <div className="flex flex-col gap-2">
                        <h3 className="text-base font-medium text-foreground">{feature.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                           {feature.description}
                        </p>
                     </div>
                  </div>
               ))}
            </div>

            <FullWidthDivider className="-bottom-px" />
         </div>
      </section>
   )
}
