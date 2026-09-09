import { useState } from "react"
import {
   IconX,
   IconDatabase,
   IconServer,
   IconPlug,
   IconLoader2,
   IconCheck,
   IconAlertCircle,
   IconChevronDown,
   IconChevronUp,
} from "@tabler/icons-react"
import type { DBType } from "@sqlose/shared"
import type { DbClientConnection } from "~/stores/dbClientStore"
import { useDbClientStore } from "~/stores/dbClientStore"

const DB_COLORS = [
   "#6366f1",
   "#8b5cf6",
   "#06b6d4",
   "#10b981",
   "#f59e0b",
   "#ef4444",
   "#ec4899",
   "#14b8a6",
]

interface TestResult {
   ok: boolean
   message: string
}

interface AddConnectionDialogProps {
   open: boolean
   onClose: () => void
   editingConnection?: DbClientConnection | null
}

interface CredentialFields {
   host: string
   port: string
   database: string
   username: string
   password: string
   ssl: boolean
}

function buildConnectionString(dbType: DBType, creds: CredentialFields): string {
   if (dbType === "sqlite") {
      return creds.host // reuse host for file path for SQLite
   }
   const scheme = dbType === "postgres" ? "postgresql" : "mysql"
   const auth =
      creds.username ? `${encodeURIComponent(creds.username)}:${encodeURIComponent(creds.password)}@` : ""
   const host = creds.host || "localhost"
   const port = creds.port || (dbType === "postgres" ? "5432" : "3306")
   const db = creds.database ? `/${creds.database}` : ""
   const ssl = creds.ssl && dbType === "postgres" ? "?sslmode=require" : ""
   return `${scheme}://${auth}${host}:${port}${db}${ssl}`
}

function parseConnectionString(dbType: DBType, cs: string): Partial<CredentialFields> {
   if (dbType === "sqlite") return { host: cs }
   try {
      const url = new URL(cs)
      return {
         host: url.hostname,
         port: url.port,
         database: url.pathname.slice(1),
         username: decodeURIComponent(url.username),
         password: decodeURIComponent(url.password),
         ssl: url.searchParams.get("sslmode") === "require",
      }
   } catch {
      return {}
   }
}

export function AddConnectionDialog({ open, onClose, editingConnection }: AddConnectionDialogProps) {
   const [dbType, setDbType] = useState<DBType>(editingConnection?.dbType ?? "postgres")
   const [name, setName] = useState(editingConnection?.name ?? "")
   const [color, setColor] = useState(editingConnection?.color ?? DB_COLORS[0])
   const [useConnectionString, setUseConnectionString] = useState(false)
   const [connectionString, setConnectionString] = useState(editingConnection?.connectionString ?? "")
   const [creds, setCreds] = useState<CredentialFields>(() => ({
      host: "localhost",
      port: dbType === "postgres" ? "5432" : "3306",
      database: "",
      username: "",
      password: "",
      ssl: false,
      ...(editingConnection ? parseConnectionString(editingConnection.dbType, editingConnection.connectionString) : {}),
   }))
   const [testing, setTesting] = useState(false)
   const [testResult, setTestResult] = useState<TestResult | null>(null)
   const [saving, setSaving] = useState(false)

   const { saveConnection, testConnection } = useDbClientStore()

   if (!open) return null

   const resolvedConnectionString = useConnectionString
      ? connectionString
      : buildConnectionString(dbType, creds)

   const handleDbTypeChange = (t: DBType) => {
      setDbType(t)
      setTestResult(null)
      setCreds(prev => ({
         ...prev,
         port: t === "postgres" ? "5432" : t === "mysql" ? "3306" : "",
      }))
   }

   const handleTest = async () => {
      setTesting(true)
      setTestResult(null)
      const result = await testConnection({ dbType, connectionString: resolvedConnectionString })
      if (result) {
         setTestResult({ ok: true, message: `Connected in ${result.latencyMs}ms` })
      } else {
         setTestResult({ ok: false, message: "Connection failed. Check your credentials." })
      }
      setTesting(false)
   }

   const handleSave = async () => {
      if (!name.trim()) return
      setSaving(true)
      const id = editingConnection?.id ?? `dbc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      await saveConnection({ id, name: name.trim(), dbType, connectionString: resolvedConnectionString, color })
      setSaving(false)
      onClose()
   }

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
         <div
            className="relative bg-bg-secondary border border-border/50 rounded-2xl shadow-2xl w-full max-w-[520px] flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh" }}
         >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
               <div className="flex items-center gap-3">
                  <div
                     className="h-8 w-8 rounded-xl flex items-center justify-center"
                     style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}
                  >
                     <IconPlug className="h-4 w-4" style={{ color }} />
                  </div>
                  <span className="font-semibold text-text-primary text-[15px]">
                     {editingConnection ? "Edit Connection" : "New DB Connection"}
                  </span>
               </div>
               <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-colors"
               >
                  <IconX className="h-4 w-4" />
               </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

               {/* Name + Color */}
               <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Connection Name</label>
                  <input
                     type="text"
                     value={name}
                     onChange={e => setName(e.target.value)}
                     placeholder="My Production DB"
                     className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                  />
               </div>

               {/* Color picker */}
               <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Color</label>
                  <div className="flex items-center gap-2">
                     {DB_COLORS.map(c => (
                        <button
                           key={c}
                           onClick={() => setColor(c)}
                           className="h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center"
                           style={{
                              background: c,
                              borderColor: color === c ? "white" : "transparent",
                              boxShadow: color === c ? `0 0 0 3px ${c}55` : "none",
                           }}
                        >
                           {color === c && <IconCheck className="h-3.5 w-3.5 text-white" />}
                        </button>
                     ))}
                  </div>
               </div>

               {/* DB Type */}
               <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Database Type</label>
                  <div className="flex gap-2">
                     {(["postgres", "mysql", "sqlite"] as DBType[]).map(t => (
                        <button
                           key={t}
                           onClick={() => handleDbTypeChange(t)}
                           className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all text-[12px] font-bold uppercase tracking-wider"
                           style={{
                              borderColor: dbType === t ? color : "transparent",
                              background: dbType === t ? `${color}18` : "var(--color-bg-tertiary)",
                              color: dbType === t ? color : "var(--color-text-muted)",
                           }}
                        >
                           {t === "sqlite" ? <IconDatabase className="h-4 w-4" /> : <IconServer className="h-4 w-4" />}
                           {t}
                        </button>
                     ))}
                  </div>
               </div>

               {/* Connection mode toggle */}
               <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">
                     {useConnectionString ? "Connection String" : "Credentials"}
                  </span>
                  {dbType !== "sqlite" && (
                     <button
                        onClick={() => { setUseConnectionString(v => !v); setTestResult(null) }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline transition-colors"
                     >
                        {useConnectionString ? (
                           <><IconChevronUp className="h-3 w-3" />Use Credentials</>
                        ) : (
                           <><IconChevronDown className="h-3 w-3" />Use Connection String</>
                        )}
                     </button>
                  )}
               </div>

               {/* SQLite file path */}
               {dbType === "sqlite" && (
                  <input
                     type="text"
                     value={creds.host}
                     onChange={e => setCreds(p => ({ ...p, host: e.target.value }))}
                     placeholder="/path/to/database.db"
                     className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 font-mono focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                  />
               )}

               {/* Connection String input */}
               {dbType !== "sqlite" && useConnectionString && (
                  <textarea
                     value={connectionString}
                     onChange={e => { setConnectionString(e.target.value); setTestResult(null) }}
                     placeholder={`postgresql://user:pass@localhost:5432/dbname`}
                     rows={3}
                     className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted/50 font-mono focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                  />
               )}

               {/* Credentials form */}
               {dbType !== "sqlite" && !useConnectionString && (
                  <div className="space-y-3">
                     <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1">
                           <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">Host</label>
                           <input
                              type="text"
                              value={creds.host}
                              onChange={e => { setCreds(p => ({ ...p, host: e.target.value })); setTestResult(null) }}
                              placeholder="localhost"
                              className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">Port</label>
                           <input
                              type="text"
                              value={creds.port}
                              onChange={e => { setCreds(p => ({ ...p, port: e.target.value })); setTestResult(null) }}
                              placeholder="5432"
                              className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">Database Name</label>
                        <input
                           type="text"
                           value={creds.database}
                           onChange={e => { setCreds(p => ({ ...p, database: e.target.value })); setTestResult(null) }}
                           placeholder="mydb"
                           className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">Username</label>
                           <input
                              type="text"
                              value={creds.username}
                              onChange={e => { setCreds(p => ({ ...p, username: e.target.value })); setTestResult(null) }}
                              placeholder="postgres"
                              autoComplete="off"
                              className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] text-text-muted font-semibold uppercase tracking-wide">Password</label>
                           <input
                              type="password"
                              value={creds.password}
                              onChange={e => { setCreds(p => ({ ...p, password: e.target.value })); setTestResult(null) }}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              className="w-full bg-bg-tertiary border border-border/50 rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
                           />
                        </div>
                     </div>
                     {dbType === "postgres" && (
                        <label className="flex items-center gap-2 cursor-pointer">
                           <div
                              onClick={() => setCreds(p => ({ ...p, ssl: !p.ssl }))}
                              className={`h-4 w-7 rounded-full transition-colors ${creds.ssl ? "bg-accent" : "bg-bg-quaternary border border-border"}`}
                           >
                              <div className={`h-3 w-3 rounded-full bg-white m-0.5 transition-transform ${creds.ssl ? "translate-x-3" : "translate-x-0"}`} />
                           </div>
                           <span className="text-[12px] text-text-muted">SSL Required</span>
                        </label>
                     )}
                  </div>
               )}

               {/* Resolved connection string preview (when using credentials) */}
               {dbType !== "sqlite" && !useConnectionString && resolvedConnectionString && (
                  <div className="bg-bg-primary/50 border border-border/30 rounded-lg px-3 py-2">
                     <p className="text-[10px] text-text-muted/60 uppercase tracking-wider font-semibold mb-1">Preview</p>
                     <p className="text-[11.5px] text-text-muted font-mono break-all">{resolvedConnectionString}</p>
                  </div>
               )}

               {/* Test result */}
               {testResult && (
                  <div
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium ${
                        testResult.ok
                           ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                           : "bg-red-500/10 border border-red-500/30 text-red-400"
                     }`}
                  >
                     {testResult.ok ? <IconCheck className="h-4 w-4 shrink-0" /> : <IconAlertCircle className="h-4 w-4 shrink-0" />}
                     {testResult.message}
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/30 bg-bg-primary/30 shrink-0 gap-3">
               <button
                  onClick={handleTest}
                  disabled={testing || !resolvedConnectionString}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border border-border/50 text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
               >
                  {testing ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : <IconPlug className="h-3.5 w-3.5" />}
                  Test Connection
               </button>
               <div className="flex gap-2">
                  <button
                     onClick={onClose}
                     className="px-4 py-2 rounded-lg text-[13px] font-semibold border border-border/50 text-text-muted hover:text-text-primary hover:bg-bg-quaternary transition-all"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleSave}
                     disabled={saving || !name.trim() || !resolvedConnectionString}
                     className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                     style={{ background: saving ? "#6366f188" : color }}
                  >
                     {saving ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                     {editingConnection ? "Update" : "Save Connection"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   )
}
