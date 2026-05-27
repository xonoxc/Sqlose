"use client"

import { Database, MessageCircle } from "lucide-react"

export default function SQLoseLandingPage() {
   return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans antialiased selection:bg-white/20 overflow-x-hidden">
         {/* Navigation */}
         <nav className="relative z-50">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between h-20 px-6 lg:px-8">
               <div className="flex items-center gap-12">
                  <div className="flex items-center gap-2 text-white">
                     <Database className="w-6 h-6" />
                     <span className="font-semibold tracking-tight text-lg">sqlose</span>
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
                     <a href="#docs" className="hover:text-white transition-colors">
                        Docs
                     </a>
                     <a href="#pricing" className="hover:text-white transition-colors">
                        Pricing
                     </a>
                     <a href="#features" className="hover:text-white transition-colors">
                        Features
                     </a>
                     <a href="#releases" className="hover:text-white transition-colors">
                        Releases
                     </a>
                     <a href="#login" className="hover:text-white transition-colors">
                        Legacy login
                     </a>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <a
                     href="#"
                     className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                     <MessageCircle className="w-4 h-4" />
                     Discord
                  </a>
                  <a
                     href="#"
                     className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                     <GitHub className="w-4 h-4" />
                     174
                  </a>
                  <button className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full text-sm font-medium transition-colors">
                     Get App
                  </button>
               </div>
            </div>
         </nav>

         {/* Hero Section */}
         <main className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-20 md:pt-32 pb-24 relative z-10 flex flex-col items-center">
            {/* Centered Text Content */}
            <div className="max-w-4xl flex flex-col items-center text-center">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/5 rounded-full text-xs font-medium text-zinc-400 mb-8">
                  <GitHub className="w-3.5 h-3.5" />
                  v1.0.0 · Latest
               </div>

               <h1 className="text-5xl sm:text-6xl md:text-[5rem] font-medium tracking-tight text-white mb-6 leading-[1.05]">
                  Ephemeral SQL environments, <br className="hidden md:block" />
                  now open source
               </h1>

               <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl font-normal leading-relaxed">
                  Use SQLose to spin up fully isolated databases in minutes, or self-host it on your
                  own infrastructure. Zero leftover clutter.
               </p>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                  <button className="w-full sm:w-auto flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-zinc-200 transition-colors">
                     Get started
                  </button>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
                     <GitHub className="w-5 h-5" />
                     Open in Github
                  </button>
               </div>
            </div>

            {/* Application Mockup with Double Border over Photo */}
            <div className="mt-20 md:mt-28 relative w-full max-w-5xl mx-auto">
               {/* Outer "Double" Border Frame (Padding & Outer Border) */}
               <div className="rounded-2xl border border-white/10 bg-[#161616]/50 p-2 sm:p-3 shadow-2xl backdrop-blur-sm">
                  {/* Inner Container implementing the requested border overlay */}
                  <div className="flex flex-col w-full relative rounded-[12px] bg-[#0a0a0a]">
                     <img
                        src="/ss.png"
                        alt="SQLose Application Interface"
                        className="w-full object-cover rounded-[12px] opacity-100 block"
                        onError={e => {
                           e.currentTarget.style.display = "none"
                           const fallback = e.currentTarget.parentElement?.querySelector(
                              ".fallback-msg"
                           ) as HTMLElement
                           if (fallback) fallback.classList.remove("hidden")
                        }}
                     />

                     {/* The crisp absolute overlay border over the photo */}
                     <div className="flex flex-col absolute left-0 top-0 right-0 bottom-0 border-solid border z-10 pointer-events-none rounded-[12px] border-white/5" />

                     {/* Fallback for missing image */}
                     <div className="fallback-msg hidden absolute inset-0 flex flex-col items-center justify-center font-medium text-sm text-zinc-600 bg-[#0a0a0a] rounded-[12px]">
                        <Database className="w-12 h-12 mb-4 text-white/5" />
                        <span>[ Place your app screenshot at /public/ss.png ]</span>
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   )
}

import type { SVGProps } from "react"

const GitHub = (props: SVGProps<SVGSVGElement>) => (
   <svg {...props} viewBox="0 0 1024 1024" fill="none">
      <path
         fillRule="evenodd"
         clipRule="evenodd"
         d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
         transform="scale(64)"
         fill="#ffff"
      />
   </svg>
)

export { GitHub }
