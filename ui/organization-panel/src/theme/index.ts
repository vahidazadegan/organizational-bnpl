"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Material 3 theme inspired by soft lavender / vivid violet UI references.
 */
export const theme = createTheme({
  direction: "rtl",
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: "#6A35FF",
          light: "#9B7BFF",
          dark: "#4B1FD6",
          contrastText: "#FFFFFF",
        },
        secondary: {
          main: "#FF8E9A",
          light: "#FFB3BB",
          dark: "#E56B78",
          contrastText: "#1A0B2E",
        },
        success: {
          main: "#D9FF7A",
          light: "#E8FFA8",
          dark: "#B8E04A",
          contrastText: "#1A0B2E",
        },
        info: {
          main: "#A2C2FF",
          light: "#C4D8FF",
          dark: "#7AA3F0",
          contrastText: "#1A0B2E",
        },
        background: {
          default: "#D8D6FF",
          paper: "#FFFFFF",
        },
        text: {
          primary: "#1A0B2E",
          secondary: "#4A3F66",
        },
        divider: "rgba(26, 11, 46, 0.12)",
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "#9B7BFF",
          light: "#C4B2FF",
          dark: "#6A35FF",
          contrastText: "#1A0B2E",
        },
        secondary: {
          main: "#FF8E9A",
          light: "#FFB3BB",
          dark: "#E56B78",
          contrastText: "#1A0B2E",
        },
        success: {
          main: "#D9FF7A",
          light: "#E8FFA8",
          dark: "#B8E04A",
          contrastText: "#1A0B2E",
        },
        info: {
          main: "#A2C2FF",
          light: "#C4D8FF",
          dark: "#7AA3F0",
          contrastText: "#1A0B2E",
        },
        background: {
          default: "#150029",
          paper: "#1F0A3A",
        },
        text: {
          primary: "#F4F0FF",
          secondary: "#C7BFE0",
        },
        divider: "rgba(244, 240, 255, 0.14)",
      },
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: "var(--font-vazirmatn), Vazirmatn, Helvetica, Arial, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
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
        containedPrimary: {
          backgroundImage: "linear-gradient(135deg, #7C4DFF 0%, #6A35FF 100%)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          ...(theme.palette.mode === "light"
            ? { backgroundColor: "#FFFFFF" }
            : {}),
        }),
        rounded: {
          borderRadius: 24,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) =>
          theme.palette.mode === "light"
            ? {
                backgroundColor: "#FFFFFF",
                backgroundImage: "none",
              }
            : {},
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.palette.mode === "light" ? { backgroundColor: "#FFFFFF" } : {},
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.palette.mode === "light" ? { backgroundColor: "#FFFFFF" } : {},
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) =>
          theme.palette.mode === "light" ? { backgroundColor: "#FFFFFF" } : {},
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) =>
          theme.palette.mode === "light" ? { backgroundColor: "#FFFFFF" } : {},
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) =>
          theme.palette.mode === "light" ? { backgroundColor: "#FFFFFF" } : {},
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(255, 255, 255, 0.55)",
        }),
        notchedOutline: {
          borderColor: "rgba(106, 53, 255, 0.25)",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "radial-gradient(1200px 600px at 10% -10%, rgba(255, 142, 154, 0.22), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(106, 53, 255, 0.18), transparent 50%)",
          backgroundAttachment: "fixed",
        },
      },
    },
  },
});
