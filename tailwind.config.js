/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Superfícies (dark)
        "surface":                   "#0d0d1c",
        "surface-dim":               "#0d0d1c",
        "surface-container-lowest":  "#000000",
        "surface-container-low":     "#121222",
        "surface-container":         "#18182a",
        "surface-container-high":    "#1e1e32",
        "surface-container-highest": "#24243a",
        "surface-bright":            "#2a2a42",
        // Texto
        "on-surface":         "#e6e3f9",
        "on-surface-variant": "#aba9be",
        // Primário (violeta)
        "primary":            "#bb9eff",
        "primary-dim":        "#874cff",
        "primary-fixed":      "#af8dff",
        "on-primary-fixed":   "#000000",
        "inverse-primary":    "#7000ff",
        // Secundário (ciano)
        "secondary":          "#00e3fd",
        "secondary-dim":      "#00d4ec",
        // Terciário (magenta)
        "tertiary":           "#ff5ed6",
        // Utilitários
        "outline":            "#757487",
        "outline-variant":    "#474658",
        "error":              "#ff6e84",
        "on-error":           "#490013",
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body:     ["Inter", "sans-serif"],
        label:    ["Inter", "sans-serif"],
        sans:     ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        soft:    "16px",
        DEFAULT: "0.75rem",
        lg:      "1rem",
        xl:      "1rem",
      },
      backgroundImage: {
        "neon-gradient":  "linear-gradient(135deg, #bb9eff 0%, #874cff 100%)",
        "glass-gradient": "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
      },
      boxShadow: {
        "neon":    "0 0 20px rgba(112, 0, 255, 0.3)",
        "cyan":    "0 24px 48px -12px rgba(0, 227, 253, 0.08)",
        "glow-sm": "0 8px 20px -6px rgba(187, 158, 255, 0.4)",
      },
    },
  },
  plugins: [],
}
