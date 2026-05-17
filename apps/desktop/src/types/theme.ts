export interface ThemeColors {
   background: string
   surface: string
   surface2: string
   sidebar: string
   sidebarActive: string
   sidebarHover: string
   border: string
   text: string
   textMuted: string
   primary: string
   secondary: string
   success: string
   warning: string
   error: string
   accent: string
   editorBackground: string
   editorSelection: string
   editorCursor: string
   resultGrid: string
   resultGridBorder: string
   tabBackground: string
   tabActive: string
   statusBar: string
   queryAccent: string
}

export interface MonacoTheme {
   base: "vs-dark" | "vs"
   rules: { token: string; foreground: string; fontStyle?: string }[]
   colors: Record<string, string>
}

export interface Theme {
   id: string
   name: string
   colors: ThemeColors
   monaco: MonacoTheme
}
