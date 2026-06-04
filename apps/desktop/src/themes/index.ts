import { defaultTheme } from "~/themes/default"
import { tokyoNight } from "~/themes/tokyo-night"
import { catppuccinMocha } from "~/themes/catppuccin-mocha"
import { dracula } from "~/themes/dracula"
import { gruvboxDark } from "~/themes/gruvbox-dark"
import { nord } from "~/themes/nord"
import { rosePine } from "~/themes/rose-pine"
import { kanagawa } from "~/themes/kanagawa"
import { oneDark } from "~/themes/one-dark"
import { githubDark } from "~/themes/github-dark"
import { solarizedDark } from "~/themes/solarized-dark"
import type { Theme } from "~/types/theme"

export const themes: Theme[] = [
   defaultTheme,
   tokyoNight,
   catppuccinMocha,
   dracula,
   gruvboxDark,
   nord,
   rosePine,
   kanagawa,
   oneDark,
   githubDark,
   solarizedDark,
]
