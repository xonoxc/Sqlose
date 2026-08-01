export const slideVariants = {
   initial: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
   }),
   enter: {
      x: 0,
      opacity: 1,
      transition: {
         duration: 0.5,
         ease: [0.25, 1, 0.5, 1] as const,
      },
   },
   exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: {
         duration: 0.4,
         ease: [0.25, 1, 0.5, 1] as const,
      },
   }),
}
