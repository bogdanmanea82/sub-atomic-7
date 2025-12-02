import { Elysia } from "elysia";

const app = new Elysia()
  .get("/", () => ({
    name: "sub-atomic-7",
    status: "operational",
    architecture: "seven-layer atomic design",
    layers: [
      "Layer 0: Configuration",
      "Layer 1: Model",
      "Layer 2: Model Service", 
      "Layer 3: Controller",
      "Layer 4: View Service",
      "Layer 5: View",
      "Layer 6: Client"
    ]
  }))
  .get("/health", () => ({ status: "healthy", timestamp: new Date().toISOString() }))
  .listen(process.env["PORT"] ?? 3000);

console.log(`🚀 sub-atomic-7 running at http://${app.server?.hostname}:${app.server?.port}`);
