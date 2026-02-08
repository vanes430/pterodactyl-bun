import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-700.css";
import { createRoot } from "react-dom/client";
import App from "@/components/App";

// Enable language support.
import "./i18n";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
