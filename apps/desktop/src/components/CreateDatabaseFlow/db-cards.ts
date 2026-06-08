import { IconDatabase, IconServer } from "@tabler/icons-react"
import type { DBType } from "@sqlose/shared"

export interface DBCard {
   type: DBType
   label: string
   description: string
   icon: typeof IconDatabase | typeof IconServer
   accent: string
   color: string
   requiresDocker: boolean
}

export const DB_CARDS: DBCard[] = [
   {
      type: "sqlite",
      label: "SQLite",
      description: "Lightweight embedded database with zero configuration. Perfect for local dev.",
      icon: IconDatabase,
      accent: "from-teal-500/20 to-teal-400/5",
      color: "text-teal-400",
      requiresDocker: false,
   },
   {
      type: "postgres",
      label: "PostgreSQL",
      description: "Advanced relational database with record-breaking compliance and features.",
      icon: IconServer,
      accent: "from-blue-500/20 to-blue-400/5",
      color: "text-blue-400",
      requiresDocker: true,
   },
   {
      type: "mysql",
      label: "MySQL",
      description: "Reliable and fast relational database, extensively used in web apps.",
      icon: IconServer,
      accent: "from-orange-500/20 to-orange-400/5",
      color: "text-orange-400",
      requiresDocker: true,
   },
]
