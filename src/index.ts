import { Elysia } from "elysia";
import { GameDomainController } from "@controller/entities/game-domain";
import { GameSubdomainController } from "@controller/entities/game-subdomain";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { homePage } from "@view/organisms/pages";
import type { EntityCardData } from "@view/organisms/pages";

const app = new Elysia()
  .use(GameDomainController)
  .use(GameSubdomainController)
  // Serve the browser bundle as a static asset
  .get("/public/main.js", () => Bun.file("public/main.js"))
  // Home page — HTML with live entity counts
  .get("/", async ({ set }) => {
    set.headers["content-type"] = "text/html; charset=utf-8";

    // Fetch entity counts for the dashboard cards
    const [gameDomainResult, gameSubdomainResult] = await Promise.all([
      GameDomainService.findMany(),
      GameSubdomainService.findMany(),
    ]);
    const gameDomainCount = gameDomainResult.success
      ? (gameDomainResult.data as unknown[]).length
      : 0;
    const gameSubdomainCount = gameSubdomainResult.success
      ? (gameSubdomainResult.data as unknown[]).length
      : 0;

    const entities: EntityCardData[] = [
      {
        name: "Game Domains",
        description: "Top-level worlds and settings that contain all other game content.",
        href: "/game-domains",
        count: gameDomainCount,
        icon: "🌍",
      },
      {
        name: "Game Subdomains",
        description: "Subdivisions within a domain — group related categories together.",
        href: "/game-subdomains",
        count: gameSubdomainCount,
        icon: "🗂️",
      },
    ];

    return homePage(entities);
  })
  .get("/health", () => ({ status: "healthy", timestamp: new Date().toISOString() }))
  .listen(process.env["PORT"] ?? 3000);

console.log(`🚀 sub-atomic-7 running at http://${app.server?.hostname}:${app.server?.port}`);
