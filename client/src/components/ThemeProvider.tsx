import { createContext, useContext } from "react";

// Light theme only provider - no theme switching allowed
type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: "light";
  setTheme: (theme: "light") => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  // Always light theme - no switching allowed
  const value = {
    theme: "light" as const,
    setTheme: () => {
      // Do nothing - theme is always light
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};