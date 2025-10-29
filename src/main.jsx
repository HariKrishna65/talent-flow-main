import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { worker } from "./lib/mock-api";
import { seedDatabase } from "./lib/seed-data";

async function initApp() {
  await worker.start({ onUnhandledRequest: "bypass" });
  await seedDatabase();
  const rootEl = document.getElementById("root");
  if (!rootEl) return;
  createRoot(rootEl).render(<App />);
}

initApp();


