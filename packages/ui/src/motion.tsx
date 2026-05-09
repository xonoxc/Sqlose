import { motion, type Variants, type HTMLMotionProps, type SVGMotionProps } from "motion/react"

export { motion }

export type { Variants, HTMLMotionProps, SVGMotionProps }

export const fadeIn: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { duration: 0.2 } },
}

export const slideInFromRight: Variants = {
   hidden: { x: 20, opacity: 0 },
   visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
}

export const slideInFromLeft: Variants = {
   hidden: { x: -20, opacity: 0 },
   visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
}

export const slideInFromBottom: Variants = {
   hidden: { y: 20, opacity: 0 },
   visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
}

export const scaleIn: Variants = {
   hidden: { scale: 0.95, opacity: 0 },
   visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 30 } },
}

export const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 }
