import { useRef, useEffect, useState, useCallback } from "react"
import { useEnvironmentStore } from "~/stores/environmentStore"
import { useSettingsStore } from "~/stores/settingsStore"
import { useEditorStore } from "~/stores/editorStore"
import { useThemeStore } from "~/stores/theme-store"
import { themes } from "~/themes"
import { useSavedQueriesStore } from "~/stores/savedQueriesStore"
import type { VimMode } from "~/lib/types"
import type { editor, IDisposable } from "monaco-editor"

export function defineMonacoTheme(monaco: typeof import("monaco-editor"), themeId: string) {
   const currentTheme = themes.find(t => t.id === themeId) ?? themes[0]
   const m = currentTheme.monaco
   monaco.editor.defineTheme("sqlose-theme", {
      base: m.base,
      inherit: true,
      rules: m.rules,
      colors: m.colors,
   })
   monaco.editor.setTheme("sqlose-theme")
}

function parseVimMode(text: string): VimMode | null {
   const upper = text.toUpperCase().trim()
   if (upper.includes("INSERT")) return "insert"
   if (upper.includes("VISUAL BLOCK")) return "visual-block"
   if (upper.includes("VISUAL LINE")) return "visual-line"
   if (upper.includes("VISUAL")) return "visual"
   if (upper.includes("NORMAL")) return "normal"
   return null
}

export function useSQLEditorLogic(
   value: string,
   onChange: (value: string) => void,
   onCommandMode?: () => void
) {
   const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
   const monacoRef = useRef<typeof import("monaco-editor") | null>(null)
   const vimModeRef = useRef<{ dispose: () => void } | null>(null)
   const vimObserverRef = useRef<MutationObserver | null>(null)
   const vimStatusRef = useRef<HTMLDivElement>(null)
   const onChangeRef = useRef(onChange)
   const contentChangeDisposableRef = useRef<IDisposable | null>(null)
   const [saveDialogOpen, setSaveDialogOpen] = useState(false)
   const [saveName, setSaveName] = useState("")

   onChangeRef.current = onChange

   const vimEnabled = useSettingsStore(s => s.vimModeEnabled)
   const selectedEnvironmentId = useEnvironmentStore(s => s.selectedEnvironmentId)
   const saveQuery = useSavedQueriesStore(s => s.saveQuery)
   const themeId = useThemeStore(s => s.themeId)

   function setupVimObserver() {
      if (!vimStatusRef.current) return
      vimObserverRef.current?.disconnect()
      const observer = new MutationObserver(() => {
         const text = vimStatusRef.current?.textContent?.trim() ?? ""
         const mode = parseVimMode(text)
         if (mode) {
            useEditorStore.getState().setVimMode(mode)
         }
      })
      observer.observe(vimStatusRef.current, {
         characterData: true,
         childList: true,
         subtree: true,
      })
      vimObserverRef.current = observer
      const initialText = vimStatusRef.current.textContent?.trim() ?? ""
      const initialMode = parseVimMode(initialText)
      if (initialMode) {
         useEditorStore.getState().setVimMode(initialMode)
      }
   }

   const applyMonacoTheme = useCallback(
      (monaco: typeof import("monaco-editor")) => {
         defineMonacoTheme(monaco, themeId)
      },
      [themeId]
   )

   const handleEditorMount = async (
      monacoEditor: editor.IStandaloneCodeEditor,
      monaco: typeof import("monaco-editor")
   ) => {
      editorRef.current = monacoEditor
      monacoRef.current = monaco

      applyMonacoTheme(monaco)

      monaco.languages.registerCompletionItemProvider("sql", {
         provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position)
            const range = {
               startLineNumber: position.lineNumber,
               endLineNumber: position.lineNumber,
               startColumn: word.startColumn,
               endColumn: word.endColumn,
            }
            const suggestions = [
               {
                  label: "SELECT",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "SELECT ",
                  range,
               },
               {
                  label: "FROM",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "FROM ",
                  range,
               },
               {
                  label: "WHERE",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "WHERE ",
                  range,
               },
               {
                  label: "INSERT",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "INSERT INTO ",
                  range,
               },
               {
                  label: "UPDATE",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "UPDATE ",
                  range,
               },
               {
                  label: "DELETE",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "DELETE FROM ",
                  range,
               },
               {
                  label: "JOIN",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "JOIN ",
                  range,
               },
               {
                  label: "LEFT JOIN",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "LEFT JOIN ",
                  range,
               },
               {
                  label: "GROUP BY",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "GROUP BY ",
                  range,
               },
               {
                  label: "ORDER BY",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "ORDER BY ",
                  range,
               },
               {
                  label: "LIMIT",
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: "LIMIT ",
                  range,
               },
            ]
            return { suggestions }
         },
      })

      monacoEditor.onKeyDown(e => {
         if (e.browserEvent.key !== ":") return
         const editorState = useEditorStore.getState()
         const vimEnabled = useSettingsStore.getState().vimModeEnabled
         if (vimEnabled && editorState.vimMode === "normal") {
            e.preventDefault()
            e.stopPropagation()
            onCommandMode?.()
         }
      })

      if (vimEnabled && vimStatusRef.current) {
         const { initVimMode } = await import("monaco-vim")
         vimModeRef.current = initVimMode(monacoEditor, vimStatusRef.current)
         setupVimObserver()
         contentChangeDisposableRef.current?.dispose()
         contentChangeDisposableRef.current = monacoEditor.onDidChangeModelContent(() => {
            onChangeRef.current(monacoEditor.getValue())
         })
      }
   }

   useEffect(() => {
      const m = monacoRef.current
      if (m) {
         defineMonacoTheme(m, themeId)
      }
   }, [themeId])

   const handleChange = (newValue: string | undefined) => {
      if (newValue !== undefined && !vimEnabled) {
         onChange(newValue)
      }
   }

   useEffect(() => {
      if (editorRef.current) {
         vimObserverRef.current?.disconnect()
         vimObserverRef.current = null
         vimModeRef.current?.dispose()
         vimModeRef.current = null
         contentChangeDisposableRef.current?.dispose()
         contentChangeDisposableRef.current = null

         if (vimEnabled && vimStatusRef.current) {
            import("monaco-vim").then(({ initVimMode }) => {
               vimModeRef.current = initVimMode(editorRef.current!, vimStatusRef.current!)
               setupVimObserver()
               contentChangeDisposableRef.current?.dispose()
               contentChangeDisposableRef.current = editorRef.current!.onDidChangeModelContent(
                  () => {
                     onChangeRef.current(editorRef.current!.getValue())
                  }
               )
            })
         }
      }
   }, [vimEnabled, onChange])

   useEffect(() => {
      return () => {
         vimObserverRef.current?.disconnect()
         vimModeRef.current?.dispose()
         contentChangeDisposableRef.current?.dispose()
      }
   }, [])

   const handleSaveSubmit = () => {
      if (saveName.trim()) {
         saveQuery(saveName.trim(), value, [], selectedEnvironmentId)
         setSaveDialogOpen(false)
         setSaveName("")
      }
   }

   return {
      editorRef,
      vimStatusRef,
      vimEnabled,
      saveDialogOpen,
      setSaveDialogOpen,
      saveName,
      setSaveName,
      selectedEnvironmentId,
      handleEditorMount,
      handleChange,
      handleSaveSubmit,
   }
}
