import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ThemeProvider";
import App from "./App";
import "./index.css";
import "./lib/i18n";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light" storageKey="bilgibite-ui-theme" forceLightMode={true}>
    <App />
  </ThemeProvider>
);
