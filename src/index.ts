import { Elysia } from "elysia";
import {
  GameDomainController,
  GameSubdomainController,
  GameCategoryController,
  GameSubcategoryController,
  ModifierController,
} from "@controller/entities";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { ModifierService } from "@model-service/entities/modifier";
import { homePage } from "@view/organisms/pages";
import type { EntityCardData } from "@view/organisms/pages";

const app = new Elysia()
  .use(GameDomainController)
  .use(GameSubdomainController)
  .use(GameCategoryController)
  .use(GameSubcategoryController)
  .use(ModifierController)
  // Serve the browser bundle as a static asset
  .get("/public/main.js", () => Bun.file("public/main.js"))
  // Home page — HTML with live entity counts
  .get("/", async ({ set }) => {
    set.headers["content-type"] = "text/html; charset=utf-8";

    // Fetch entity counts for the dashboard cards
    const [gameDomainResult, gameSubdomainResult, gameCategoryResult, gameSubcategoryResult, modifierResult] = await Promise.all([
      GameDomainService.findMany(),
      GameSubdomainService.findMany(),
      GameCategoryService.findMany(),
      GameSubcategoryService.findMany(),
      ModifierService.findMany(),
    ]);
    const gameDomainCount = gameDomainResult.success
      ? (gameDomainResult.data as unknown[]).length
      : 0;
    const gameSubdomainCount = gameSubdomainResult.success
      ? (gameSubdomainResult.data as unknown[]).length
      : 0;
    const gameCategoryCount = gameCategoryResult.success
      ? (gameCategoryResult.data as unknown[]).length
      : 0;
    const gameSubcategoryCount = gameSubcategoryResult.success
      ? (gameSubcategoryResult.data as unknown[]).length
      : 0;
    const modifierCount = modifierResult.success
      ? (modifierResult.data as unknown[]).length
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
      {
        name: "Game Categories",
        description: "Classify content within subdomains — the third level of the hierarchy.",
        href: "/game-categories",
        count: gameCategoryCount,
        icon: "📂",
      },
      {
        name: "Game Subcategories",
        description: "Fine-grained classification within categories — the deepest hierarchy level.",
        href: "/game-subcategories",
        count: gameSubcategoryCount,
        icon: "📑",
      },
      {
        name: "Modifiers",
        description: "Atomic gameplay statistics — prefix and suffix modifiers tied to the full hierarchy.",
        href: "/modifiers",
        count: modifierCount,
        icon: "⚔️",
      },
    ];

    return homePage(entities);
  })
  .get("/health", () => ({ status: "healthy", timestamp: new Date().toISOString() }))
  .listen(process.env["PORT"] ?? 3000);

console.log(`🚀 sub-atomic-7 running at http://${app.server?.hostname}:${app.server?.port}`);
