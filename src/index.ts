import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import {
  GameDomainController,
  GameSubdomainController,
  GameCategoryController,
  GameSubcategoryController,
  StatController,
  ModifierController,
  CharacterClassController,
  ItemController,
} from "@controller/entities";
import { GameDomainService } from "@model-service/entities/game-domain";
import { GameSubdomainService } from "@model-service/entities/game-subdomain";
import { GameCategoryService } from "@model-service/entities/game-category";
import { GameSubcategoryService } from "@model-service/entities/game-subcategory";
import { StatService } from "@model-service/entities/stat";
import { ModifierService } from "@model-service/entities/modifier";
import { CharacterClassService } from "@model-service/entities/character-class";
import { ItemService } from "@model-service/entities/item";
import { homePage } from "@view/organisms/pages";
import type { EntityCardData } from "@view/organisms/pages";

const app = new Elysia()
  .use(openapi({
    documentation: {
      info: { title: "Sub-Atomic 7 CMS", version: "0.1.0" },
      tags: [
        { name: "Game Domains",       description: "Top-level game worlds" },
        { name: "Game Subdomains",    description: "Subdivisions within a domain" },
        { name: "Game Categories",    description: "Classifications within subdomains" },
        { name: "Game Subcategories", description: "Fine-grained category levels" },
        { name: "Stats",              description: "Numeric stat dimensions — health, mana, armor, etc." },
        { name: "Item Modifiers",     description: "Atomic gameplay stat modifiers" },
        { name: "Character Classes",  description: "Playable archetypes with per-stat base values" },
        { name: "Items",              description: "Equipment and loot item templates" },
      ],
    },
  }))
  .use(GameDomainController)
  .use(GameSubdomainController)
  .use(GameCategoryController)
  .use(GameSubcategoryController)
  .use(StatController)
  .use(ModifierController)
  .use(CharacterClassController)
  .use(ItemController)
  // Serve the browser bundle as a static asset
  .get("/public/main.js", () => Bun.file("public/main.js"))
  // Home page — HTML with live entity counts
  .get("/", async ({ set }) => {
    set.headers["content-type"] = "text/html; charset=utf-8";

    // Fetch entity counts for the dashboard cards
    const [gameDomainResult, gameSubdomainResult, gameCategoryResult, gameSubcategoryResult, statResult, modifierResult, characterClassResult, itemResult] = await Promise.all([
      GameDomainService.findMany(),
      GameSubdomainService.findMany(),
      GameCategoryService.findMany(),
      GameSubcategoryService.findMany(),
      StatService.findMany(),
      ModifierService.findMany(),
      CharacterClassService.findMany(),
      ItemService.findMany(),
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
    const statCount = statResult.success
      ? (statResult.data as unknown[]).length
      : 0;
    const modifierCount = modifierResult.success
      ? (modifierResult.data as unknown[]).length
      : 0;
    const characterClassCount = characterClassResult.success
      ? (characterClassResult.data as unknown[]).length
      : 0;
    const itemCount = itemResult.success
      ? (itemResult.data as unknown[]).length
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
        name: "Stats",
        description: "Numeric stat dimensions — health, mana, armor, and more.",
        href: "/stats",
        count: statCount,
        icon: "📊",
      },
      {
        name: "Modifiers",
        description: "Atomic gameplay statistics — prefix and suffix modifiers tied to the full hierarchy.",
        href: "/modifiers",
        count: modifierCount,
        icon: "⚔️",
      },
      {
        name: "Character Classes",
        description: "Playable archetypes with a per-stat base value sheet.",
        href: "/character-classes",
        count: characterClassCount,
        icon: "🧙",
      },
      {
        name: "Items",
        description: "Equipment and loot item templates with per-stat base values.",
        href: "/items",
        count: itemCount,
        icon: "🗡️",
      },
    ];

    return homePage(entities);
  })
  .get("/health", () => ({ status: "healthy", timestamp: new Date().toISOString() }))
  .listen(process.env["PORT"] ?? 3000);

console.log(`🚀 sub-atomic-7 running at http://${app.server?.hostname}:${app.server?.port}`);
