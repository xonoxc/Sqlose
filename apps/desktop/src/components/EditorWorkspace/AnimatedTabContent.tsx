import { motion } from "motion/react"

interface AnimatedTabContentProps {
   className?: string
   children: React.ReactNode
}

export function AnimatedTabContent({ className, children }: AnimatedTabContentProps) {
   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.1 }}
         className={className}
      >
         {children}
      </motion.div>
   )
}
