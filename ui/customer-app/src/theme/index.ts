"use client";

import { createTheme } from "@mui/material/styles";

/** Material 3 theme — teal/slate, distinct from organization-panel. */
export const theme = createTheme({
  direction: "rtl",
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: "#0F766E",
          light: "#2DD4BF",
          dark: "#115E59",
          contrastText: "#FFFFFF",
        },
        secondary: {
          main: "#0E7490",
          light: "#22D3EE",
          dark: "#155E75",
          contrastText: "#FFFFFF",
        },
        success: {
          main: "#15803D",
          light: "#4ADE80",
          dark: "#166534",
          contrastText: "#FFFFFF",
        },
        info: {
          main: "#0369A1",
          light: "#38BDF8",
          dark: "#075985",
          contrastText: "#FFFFFF",
        },
        background: {
          default: "#F8FAFC",
          paper: "#FFFFFF",
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
        },
        divider: "rgba(15, 23, 42, 0.12)",
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "#2DD4BF",
          light: "#5EEAD4",
          dark: "#0F766E",
          contrastText: "#042F2E",
        },
        secondary: {
          main: "#22D3EE",
          light: "#67E8F9",
          dark: "#0E7490",
          contrastText: "#083344",
        },
        success: {
          main: "#4ADE80",
          light: "#86EFAC",
          dark: "#15803D",
          contrastText: "#052E16",
        },
        info: {
          main: "#38BDF8",
          light: "#7DD3FC",
          dark: "#0369A1",
          contrastText: "#082F49",
        },
        background: {
          default: "#0B1220",
          paper: "#111827",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#94A3B8",
        },
        divider: "rgba(241, 245, 249, 0.14)",
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "var(--font-vazirmatn), Vazirmatn, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: "100%",
        },
        body: {
          minHeight: "100%",
          margin: 0,
          backgroundImage: "none",
        },
        "#__next": {
          minHeight: "100%",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 20,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
  },
});
