/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Material 3 tokens – primary navy from "Intake Updated Style"
        primary: "#456076",
        "on-primary": "#ffffff",
        "primary-container": "#cce5ff",
        "on-primary-container": "#001d32",
        "primary-fixed": "#cce5ff",
        "primary-fixed-dim": "#a6c9e9",
        "on-primary-fixed": "#001d32",
        "on-primary-fixed-variant": "#2c485d",

        secondary: "#53606c",
        "on-secondary": "#ffffff",
        "secondary-container": "#d6e4f3",
        "on-secondary-container": "#101c27",
        "secondary-fixed": "#d6e4f3",
        "secondary-fixed-dim": "#bac8d6",

        tertiary: "#68587a",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#eedcff",
        "on-tertiary-container": "#231533",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#410002",

        background: "#fbf9fa",
        "on-background": "#191c1e",
        surface: "#fbf9fa",
        "on-surface": "#191c1e",
        "surface-dim": "#dbd9da",
        "surface-bright": "#fbf9fa",
        "surface-variant": "#dfe3eb",
        "on-surface-variant": "#43474e",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f4",
        "surface-container": "#efedf0",
        "surface-container-high": "#e9e7e9",
        "surface-container-highest": "#e3e2e3",
        outline: "#73777f",
        "outline-variant": "#c3c6cf",
        "inverse-surface": "#2e3133",
        "inverse-on-surface": "#f0f0f1",
        "inverse-primary": "#a6c9e9",

        // Success color for positive states (not in MD3 but useful)
        success: "#0f7b3f",
        "on-success": "#ffffff",
        "success-container": "#d6f5de",
        "on-success-container": "#002112",

        // Warning amber
        warning: "#b86f00",
        "warning-container": "#ffddb0",
        "on-warning-container": "#2a1700",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        base: "8px",
        md: "16px",
        gutter: "16px",
        lg: "24px",
        margin: "24px",
        xl: "32px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        "label-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
      },
      fontSize: {
        "label-md": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.05)",
      },
    },
  },
  plugins: [],
};
