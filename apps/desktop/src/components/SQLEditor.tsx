import { useRef, useCallback, useEffect, lazy, Suspense } from "react"
import type { editor } from "monaco-editor"
import { cn } from "@sqlose/ui"
import { IconPlayerPlay, IconSettings } from "@tabler/icons-react"
import { useEditorStore } from "../stores/editorStore"
import { useEnvironmentStore } from "../stores/environmentStore"
import { useSettingsStore } from "../stores/settingsStore"

const Editor = lazy(() => import("@monaco-editor/react"))

interface SQLEditorProps {
   value: string
   onChange: (value: string) => void
   onExecute: () => void
   onSettingsOpen: () => void
   isExecuting: boolean
   executionTimeMs: number | null
}

export function SQLEditor({ value, onChange, onExecute, onSettingsOpen, isExecuting, executionTimeMs }: SQLEditorProps) {
   const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
   const vimModeRef = useRef<{ dispose: () => void } | null>(null)
   const vimStatusRef = useRef<HTMLDivElement>(null)

   const vimMode = useEditorStore((s) => s.vimMode)
   const vimEnabled = useSettingsStore((s) => s.vimModeEnabled)
   const selectedEnvironmentId = useEnvironmentStore((s) => s.selectedEnvironmentId)
   const getEnvironment = useEnvironmentStore((s) => s.getEnvironment)

   const selectedEnv = selectedEnvironmentId ? getEnvironment(selectedEnvironmentId) : null

   const handleEditorMount = useCallback(
      async (monacoEditor: editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => {
         editorRef.current = monacoEditor

         monaco.editor.defineTheme("sqlose-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
               { token: "keyword", foreground: "479e8d", fontStyle: "bold" },
               { token: "identifier", foreground: "eeeeee" },
               { token: "string", foreground: "c28938" },
               { token: "number", foreground: "57b09f" },
               { token: "comment", foreground: "656565", fontStyle: "italic" },
               { token: "operator", foreground: "909090" },
               { token: "delimiter", foreground: "909090" },
               { token: "type", foreground: "378b7b" }
            ],
            colors: {
               "editor.background": "#0e0e0e",
               "editor.foreground": "#eeeeee",
               "editorLineNumber.foreground": "#444444",
               "editorLineNumber.activeForeground": "#909090",
               "editor.selectionBackground": "#283b38",
               "editor.inactiveSelectionBackground": "#1e2826",
               "editorCursor.foreground": "#57b09f",
               "editorIndentGuide.background": "#232323",
               "editorIndentGuide.activeBackground": "#444444",
               "editor.lineHighlightBackground": "#141414",
               "editorWidget.background": "#141414",
               "editorWidget.border": "#232323"
            }
         })

         monaco.editor.setTheme("sqlose-dark")

         monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: (model, position) => {
               const word = model.getWordUntilPosition(position)
               const range = {
                  startLineNumber: position.lineNumber,
                  endLineNumber: position.lineNumber,
                  startColumn: word.startColumn,
                  endColumn: word.endColumn,
               }
               const suggestions = [
                  { label: 'SELECT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'SELECT ', range },
                  { label: 'FROM', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'FROM ', range },
                  { label: 'WHERE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'WHERE ', range },
                  { label: 'INSERT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'INSERT INTO ', range },
                  { label: 'UPDATE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'UPDATE ', range },
                  { label: 'DELETE', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'DELETE FROM ', range },
                  { label: 'JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'JOIN ', range },
                  { label: 'LEFT JOIN', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'LEFT JOIN ', range },
                  { label: 'GROUP BY', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'GROUP BY ', range },
                  { label: 'ORDER BY', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'ORDER BY ', range },
                  { label: 'LIMIT', kind: monaco.languages.CompletionItemKind.Keyword, insertText: 'LIMIT ', range },
               ]
               return { suggestions }
            }
         })

         if (vimEnabled && vimStatusRef.current) {
            const { initVimMode } = await import("monaco-vim")
            vimModeRef.current = initVimMode(monacoEditor, vimStatusRef.current)
            monacoEditor.onDidChangeModelContent(() => {
               onChange(monacoEditor.getValue())
            })
         }
      },
      [vimEnabled, onChange],
   )

   const handleChange = useCallback(
      (newValue: string | undefined) => {
         if (newValue !== undefined && !vimEnabled) {
            onChange(newValue)
         }
      },
      [vimEnabled, onChange],
   )

   useEffect(() => {
      if (editorRef.current) {
         if (vimModeRef.current) {
            vimModeRef.current.dispose()
            vimModeRef.current = null
         }

         if (vimEnabled && vimStatusRef.current) {
            import("monaco-vim").then(({ initVimMode }) => {
               vimModeRef.current = initVimMode(editorRef.current!, vimStatusRef.current!)
               editorRef.current!.onDidChangeModelContent(() => {
                  onChange(editorRef.current!.getValue())
               })
            })
         }
      }
   }, [vimEnabled, onChange])

   useEffect(() => {
      return () => {
         vimModeRef.current?.dispose()
      }
   }, [])

   return (
      <div className="flex flex-col h-full bg-[#111111] w-full">
         <div className="flex items-center justify-between h-10 px-4 border-b border-[#1e1e1e] bg-[#111111] shrink-0">
            <div className="flex items-center gap-3">
               <button
                  onClick={onExecute}
                  disabled={isExecuting || !selectedEnvironmentId || !value.trim()}
                  className={cn(
                     "flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-semibold transition-all outline-none",
                     (isExecuting || !selectedEnvironmentId || !value.trim())
                        ? "bg-accent/20 text-text-muted cursor-not-allowed"
                        : "bg-accent hover:bg-accent-light text-white shadow-sm"
                  )}
               >
                  {isExecuting ? (
                     <>
                        <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Running...
                     </>
                  ) : (
                     <>
                        <IconPlayerPlay className="h-3 w-3 fill-current" />
                        Run
                     </>
                  )}
               </button>

               {executionTimeMs !== null && !isExecuting && (
                  <span className="text-[10px] text-text-muted font-mono">
                     {executionTimeMs}ms
                  </span>
               )}

               <div className="flex items-center gap-1 ml-2 border-l border-[#222] pl-3">
                  <button className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-[#222] transition-colors" aria-label="Save query">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button
                  onClick={onSettingsOpen}
                  className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-[#222] transition-colors"
                  aria-label="Settings"
               >
                  <IconSettings className="h-3.5 w-3.5" />
               </button>
               <span className="text-[11px] font-semibold text-text-muted bg-[#161616] border border-[#222] px-2 py-0.5 rounded uppercase min-w-14 text-center">
                  {selectedEnv?.dbType ?? "SQL"}
               </span>
            </div>
         </div>
         <div className="flex-1 relative">
            <Suspense fallback={
               <div className="flex items-center justify-center h-full text-sm text-text-muted">
                  Loading editor...
               </div>
            }>
               <Editor
                  height="100%"
                  defaultLanguage="sql"
                  value={value}
                  onChange={handleChange}
                  onMount={handleEditorMount}
                  options={{
                     minimap: { enabled: false },
                     fontSize: 13,
                     fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
                     lineHeight: 20,
                     lineNumbersMinChars: 2,
                     lineNumbers: "on",
                     scrollBeyondLastLine: false,
                     wordWrap: "on",
                     padding: { top: 12, bottom: 12 },
                     suggestOnTriggerCharacters: true,
                     quickSuggestions: true,
                     cursorBlinking: "solid",
                     cursorSmoothCaretAnimation: "off",
                     smoothScrolling: false,
                     renderLineHighlight: "line",
                     fontLigatures: true,
                     matchBrackets: "near",
                     bracketPairColorization: { enabled: true }
                  }}
               />
            </Suspense>
            <div
               ref={vimStatusRef}
               className={cn(
                  "absolute bottom-0 left-0 z-10 text-[10px] font-mono px-2 py-0.5 rounded-tr pointer-events-none select-none",
                  vimEnabled ? "block" : "hidden",
                  (vimMode === "insert" || vimMode === "visual" || vimMode === "visual-line" || vimMode === "visual-block")
                     ? "bg-green-700/50 text-green-300"
                     : vimMode === "normal"
                       ? "bg-bg-quaternary text-text-muted"
                       : "bg-yellow-700/50 text-yellow-300",
               )}
            >
               {vimMode.toUpperCase().replace("-", " ")}
            </div>
         </div>
      </div>
   )
}
