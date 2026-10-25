import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sitio público
        canvas: v("canvas"),
        "canvas-alt": v("canvas-alt"),
        surface: v("surface"),
        ink: v("ink"),
        "ink-2": v("ink-2"),
        "ink-3": v("ink-3"),
        line: v("line"),
        "line-strong": v("line-strong"),
        "nav-open": v("nav-open"),
        "line-nav": v("line-nav"),
        field: v("field"),
        "field-line": v("field-line"),
        accent: v("accent"),
        verdant: v("verdant"),
        brand: v("brand"),
        "brand-hover": v("brand-hover"),
        "brand-press": v("brand-press"),
        link: v("link"),
        danger: v("danger"),
        success: v("success"),
        // Panel
        app: {
          bg: v("app-bg"),
          bar: v("app-bar"),
          card: v("app-card"),
          field: v("app-field"),
          hover: v("app-hover"),
          line: v("app-line"),
          fg: v("app-fg"),
          "fg-2": v("app-fg-2"),
        },
        // Chat
        chat: {
          bg: v("chat-bg"),
          panel: v("chat-panel"),
          pill: v("chat-pill"),
          card: v("chat-card"),
          composer: v("chat-composer"),
          hover: v("chat-hover"),
          fg: v("chat-fg"),
          "fg-2": v("chat-fg-2"),
        },
        // Agentes (solo personajes y línea de estado)
        agent: {
          lola: v("agent-lola"),
          clara: v("agent-clara"),
          victor: v("agent-victor"),
          iris: v("agent-iris"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Helvetica Neue", "Arial", "sans-serif"],
      },
      borderRadius: {
        control: "var(--radius-control)",
        field: "var(--radius-field)",
        card: "var(--radius-card)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        in: "cubic-bezier(0.4, 0, 1, 1)",
      },
      maxWidth: {
        page: "1280px",
        measure: "62ch",
      },
      spacing: {
        gutter: "var(--gutter)",
        section: "var(--section)",
        header: "var(--header-h)",
      },
    },
  },
  // `light:` y `dark:` siguen al atributo data-theme de <html> (oscuro por defecto).
  darkMode: ["variant", ':is([data-theme="dark"] &)'],
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ':is([data-theme="light"] &)');
    }),
  ],
};

export default config;
