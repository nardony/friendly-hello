import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Disable console methods in production to prevent data leaking
if (import.meta.env.PROD) {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.warn = noop;
  console.table = noop;
  console.dir = noop;
}

createRoot(document.getElementById("root")!).render(<App />);
