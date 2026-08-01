import type { DBType } from "@sqlose/shared"

export interface ForeignKeyRelation {
   fromCol: string
   toTable: string
   toCol: string
}

export interface SQLDialect {
   listTablesSQL: string
   columnsSQL: (table: string) => string
   fkSQL: (table: string) => string
   mapFkRow: (row: Record<string, unknown>) => ForeignKeyRelation
}

function escapeTableName(tableName: string): string {
   return tableName.replace(/'/g, "''")
}

export const SQL_DIALECTS: Record<DBType, SQLDialect> = {
   postgres: {
      listTablesSQL: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
      columnsSQL: table => {
         const safeTable = escapeTableName(table)
         return `SELECT column_name, data_type, is_nullable, COALESCE(column_default, '') as column_default, COALESCE((SELECT true FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = '${safeTable}' AND tc.constraint_type = 'PRIMARY KEY' AND kcu.column_name = c.column_name AND tc.table_schema = 'public'), false) as pk FROM information_schema.columns c WHERE table_name = '${safeTable}' AND table_schema = 'public' ORDER BY ordinal_position`
      },
      fkSQL: table => {
         const safeTableName = escapeTableName(table)
         return `
        SELECT
          kcu.column_name AS from_col,
          ccu.table_name AS to_table,
          ccu.column_name AS to_col
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
         AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${safeTableName}'
          AND tc.table_schema = 'public'
      `
      },
      mapFkRow: r => ({
         fromCol: String(r.from_col),
         toTable: String(r.to_table),
         toCol: String(r.to_col),
      }),
   },
   mysql: {
      listTablesSQL: `SELECT TABLE_NAME as table_name FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`,
      columnsSQL: table => {
         const safeTable = escapeTableName(table)
         return `SELECT COLUMN_NAME as column_name, DATA_TYPE as data_type, IS_NULLABLE as is_nullable, COALESCE(COLUMN_KEY, '') as column_key FROM information_schema.columns WHERE TABLE_NAME = '${safeTable}' AND TABLE_SCHEMA = DATABASE() ORDER BY ORDINAL_POSITION`
      },
      fkSQL: table => {
         const safeTableName = escapeTableName(table)
         return `
        SELECT
          COLUMN_NAME AS from_col,
          REFERENCED_TABLE_NAME AS to_table,
          REFERENCED_COLUMN_NAME AS to_col
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_NAME = '${safeTableName}'
          AND TABLE_SCHEMA = DATABASE()
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `
      },
      mapFkRow: r => ({
         fromCol: String(r.from_col),
         toTable: String(r.to_table),
         toCol: String(r.to_col),
      }),
   },
   sqlite: {
      listTablesSQL: `SELECT name as table_name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
      columnsSQL: table =>
         `SELECT name as column_name, type as data_type, CASE WHEN "notnull" = 0 THEN 'YES' ELSE 'NO' END as is_nullable, pk FROM pragma_table_info('${escapeTableName(table)}')`,
      fkSQL: table => `PRAGMA foreign_key_list('${escapeTableName(table)}')`,
      mapFkRow: r => ({
         fromCol: String(r.from),
         toTable: String(r.table),
         toCol: String(r.to),
      }),
   },
}
