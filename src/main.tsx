import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./index.css";

export const createRoot = ViteReactSSG(
  // react-router-dom data routes
  { routes },
  // setup function for side effects (optional)
  () => {
    // Custom setup can go here if needed
  }
);
