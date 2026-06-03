import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero"
import { FeaturesSection } from "@/components/features-section"
import Peoplesay from "@/components/PeopleSay"

export default function page() {
   return (
      <div className="relative flex min-h-screen flex-col overflow-hidden px-4 supports-[overflow:clip]:overflow-clip">
         <Header />
         <main
            className={cn(
               "relative mx-auto max-w-6xl grow",
               "before:absolute before:-inset-y-14 before:-left-px before:w-px before:bg-border",
               "after:absolute after:-inset-y-14 after:-right-px after:w-px after:bg-border"
            )}
         >
            <HeroSection />
            <FeaturesSection />
            <Peoplesay />
         </main>
      </div>
   )
}
