import { cn } from "@/lib/utils"
import { DecorIcon } from "@/components/decor-icon"
import { FullWidthDivider } from "@/components/full-width-divider"
import { GitHub } from "@/components/ui/githubsvg"
import { Discord } from "@/components/ui/discord"
import { Database } from "lucide-react"
import {
   TestimonialAuthor,
   TestimonialAuthorName,
   TestimonialAuthorTagline,
   TestimonialAvatar,
   TestimonialAvatarImg,
   TestimonialAvatarRing,
   TestimonialQuote,
   TestimonialVerifiedBadge,
} from "@/components/ui/testimonial"
import { TestimonialSpotlight } from "@/components/ui/testimonial-spotlight"

const testimonials = [
   {
      quote: "You’re doing amazing work.",
      author: "Dev Hari Ojha ",
      tagline: "Full stack Developer",
      avatar: "https://www.devfolio.tech/_next/image?url=%2Fassets%2Flogo%202.png&w=128&q=75",
      href: "https://devfolio.tech",
   },
   {
      quote: "Sqlose is a game changer for ephemeral testing.",
      author: "Arpit Yadav",
      tagline: "Software Engineer",
      avatar: "https://avatars.githubusercontent.com/u/118053362?v=4",
      href: "https://xonoxc.online",
   },
   {
      quote: "The speed of spinning up isolated DBs is incredible.",
      author: "Jane Smith",
      tagline: "DevOps Lead",
      avatar: "https://unavatar.io/x/janesmith",
      href: "#",
   },
   {
      quote: "Finally, a tool that makes SQL development seamless.",
      author: "Alex Rivera",
      tagline: "Full Stack Developer",
      avatar: "https://unavatar.io/x/alexrivera",
      href: "#",
   },
   {
      quote: "Minimalistic, powerful, and open source. Love it.",
      author: "Sarah Chen",
      tagline: "Open Source Contributor",
      avatar: "https://unavatar.io/x/sarahchen",
      href: "#",
   },
   {
      quote: "Zero leftover clutter is exactly what we needed.",
      author: "Michael Brown",
      tagline: "CTO at Startup",
      avatar: "https://unavatar.io/x/michaelbrown",
      href: "#",
   },
]

export default function Peoplesay() {
   return (
      <section className="relative pb-12 md:pb-16">
         <h2 className="py-6 text-center font-medium text-lg text-muted-foreground tracking-tight md:text-xl">
            What <span className="text-foreground">People say</span>
         </h2>
         <div className="relative">
            <DecorIcon className="size-4" position="top-left" />
            <DecorIcon className="size-4" position="top-right" />
            <DecorIcon className="size-4" position="bottom-left" />
            <DecorIcon className="size-4" position="bottom-right" />

            <FullWidthDivider className="-top-px" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
               {testimonials.map((t, i) => (
                  <a
                     key={i}
                     className={cn(
                        "group block max-w-full p-6 transition-colors hover:bg-muted/30",
                        "border-b border-border last:border-b-0",
                        i % 2 === 0 && "md:border-r md:border-border",
                        i === 4 && "md:border-b-0",
                        "lg:border-r-0",
                        i % 3 === 1 && "lg:border-x lg:border-border",
                        i >= 3 && "lg:border-b-0"
                     )}
                     href={t.href}
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                     <TestimonialSpotlight className="rounded-none bg-transparent inset-ring-0 [--spotlight-color:rgba(219,39,119,0.15)] dark:[--spotlight-color:rgba(255,255,255,0.1)]">
                        <div className="flex flex-col gap-6">
                           <TestimonialQuote className="font-serif">
                              <p>{t.quote}</p>
                           </TestimonialQuote>

                           <TestimonialAuthor>
                              <TestimonialAvatar>
                                 <TestimonialAvatarImg src={t.avatar} alt={t.author} />
                                 <TestimonialAvatarRing />
                              </TestimonialAvatar>

                              <TestimonialAuthorName>
                                 {t.author}
                                 <TestimonialVerifiedBadge className="text-info">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                       <path
                                          fill="currentColor"
                                          d="M24 12a4.454 4.454 0 0 0-2.564-3.91 4.437 4.437 0 0 0-.948-4.578 4.436 4.436 0 0 0-4.577-.948A4.44 4.44 0 0 0 12 0a4.423 4.423 0 0 0-3.9 2.564 4.434 4.434 0 0 0-2.43-.178 4.425 4.425 0 0 0-2.158 1.126 4.42 4.42 0 0 0-1.12 2.156 4.42 4.42 0 0 0 .183 2.421A4.456 4.456 0 0 0 0 12a4.465 4.465 0 0 0 2.576 3.91 4.433 4.433 0 0 0 .936 4.577 4.459 4.459 0 0 0 4.577.95A4.454 4.454 0 0 0 12 24a4.439 4.439 0 0 0 3.91-2.563 4.26 4.26 0 0 0 5.526-5.526A4.453 4.453 0 0 0 24 12Zm-13.709 4.917-4.38-4.378 1.652-1.663 2.646 2.646L15.83 7.4l1.72 1.591-7.258 7.926Z"
                                       />
                                    </svg>
                                 </TestimonialVerifiedBadge>
                              </TestimonialAuthorName>

                              <TestimonialAuthorTagline>{t.tagline}</TestimonialAuthorTagline>
                           </TestimonialAuthor>
                        </div>
                     </TestimonialSpotlight>
                  </a>
               ))}
            </div>

            {/* Footer Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-border">
               {/* Brand Section */}
               <div className="p-8 lg:col-span-1 border-b md:border-r border-border">
                  <h3 className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
                     <Database className="size-6" />
                     Sqlose
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                     Modern development environment for ephemeral SQL databases. Spin up, test, and
                     discard with zero friction.
                  </p>
               </div>

               {/* Resource Links */}
               <div className="p-8 border-b lg:border-r border-border">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                     Product
                  </h4>
                  <ul className="space-y-3 text-sm">
                     <li>
                        <a
                           href="#"
                           className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                           Features
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                           Integrations
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                           Documentation
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Support Links */}
               <div className="p-8 border-b md:border-r border-border md:border-b-0">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                     Support
                  </h4>
                  <ul className="space-y-3 text-sm">
                     <li>
                        <a
                           href="https://github.com/xonoxc/Sqlose/issues"
                           className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                           GitHub Issues
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                           Community
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                           Changelog
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Social/Connect */}
               <div className="p-8 border-b md:border-b-0 border-border">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                     Connect
                  </h4>
                  <div className="flex gap-3 mb-6">
                     <a
                        href="https://github.com/xonoxc/Sqlose"
                        target="_blank"
                        rel="noreferrer"
                        className="flex size-9 items-center justify-center border border-border hover:bg-muted transition-colors"
                     >
                        <GitHub className="size-5" />
                     </a>
                     <a
                        href="#"
                        target="_blank"
                        rel="noreferrer"
                        className="flex size-9 items-center justify-center border border-border hover:bg-muted transition-colors"
                     >
                        <Discord className="size-5" />
                     </a>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                     Release: v1.0.0
                  </p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4 border-t border-border">
               <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  © 2026 Sqlose OSS. Distributed under MIT License.
               </p>
               <div className="flex gap-8">
                  <a
                     href="#"
                     className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium hover:text-foreground transition-colors"
                  >
                     Privacy Policy
                  </a>
                  <a
                     href="#"
                     className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium hover:text-foreground transition-colors"
                  >
                     Terms of Service
                  </a>
               </div>
            </div>

            <FullWidthDivider className="-bottom-px" />
         </div>
      </section>
   )
}
