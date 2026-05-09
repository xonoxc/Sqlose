import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"

/** @type {import("eslint").Linter.Config[]} */
export default [
   {
      files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
      ignores: ["dist/**", "node_modules/**"],
      languageOptions: {
         globals: { ...globals.browser, ...globals.node },
         parserOptions: {
            ecmaFeatures: { jsx: true },
         },
      },
      plugins: {
         react: pluginReact,
         "react-hooks": pluginReactHooks,
      },
      rules: {
         ...pluginReact.configs.recommended.rules,
         ...pluginReactHooks.configs.recommended.rules,
         "react/react-in-jsx-scope": "off",
         "react/prop-types": "off",
      },
      settings: {
         react: { version: "detect" },
      },
   },
]
