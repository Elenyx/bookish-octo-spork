import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "../shared/schema";
import { gameEngine } from "./services/gameEngine";
import { combatSystem } from "./services/combatSystem";
import { explorationSystem } from "./services/explorationSystem";
import { economySystem } from "./services/economySystem";
import { guildSystem } from "./services/guildSystem";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/user/:discordId", async (req, res) => {
    try {
      const user = await storage.getUserByDiscordId(req.params.discordId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/user/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await gameEngine.registerUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to register user" });
    }
  });

  // Ship routes
  app.get("/api/user/:userId/ships", async (req, res) => {
    try {
      const ships = await storage.getUserShips(req.params.userId);
      res.json(ships);
    } catch (error) {
      res.status(500).json({ message: "Failed to get ships" });
    }
  });

  app.post("/api/user/:userId/ship/activate", async (req, res) => {
    try {
      const { shipId } = req.body;
      await storage.setActiveShip(req.params.userId, shipId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate ship" });
    }
  });

  app.post("/api/user/:userId/ship/upgrade", async (req, res) => {
    try {
      const { shipId } = req.body;
      const result = await gameEngine.upgradeShip(req.params.userId, shipId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to upgrade ship" });
    }
  });

  app.post("/api/user/:userId/ship/purchase", async (req, res) => {
    try {
      const { shipType } = req.body;
      const result = await gameEngine.purchaseShip(req.params.userId, shipType);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to purchase ship" });
    }
  });

  // Exploration routes
  app.post("/api/user/:userId/explore", async (req, res) => {
    try {
      const { type, sector } = req.body;
      const result = await explorationSystem.explore(req.params.userId, type, sector);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Exploration failed" });
    }
  });

  app.get("/api/user/:userId/explorations", async (req, res) => {
    try {
      const explorations = await storage.getUserExplorations(req.params.userId);
      res.json(explorations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exploration history" });
    }
  });

  // Combat routes
  app.post("/api/user/:userId/combat/pve", async (req, res) => {
    try {
      const { enemyType } = req.body;
      const result = await combatSystem.pveCompat(req.params.userId, enemyType);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Combat failed" });
    }
  });

  app.post("/api/user/:userId/combat/pvp", async (req, res) => {
    try {
      const { targetUserId } = req.body;
      const result = await combatSystem.pvpCombat(req.params.userId, targetUserId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "PvP combat failed" });
    }
  });

  // Market routes
  app.get("/api/market/items", async (req, res) => {
    try {
      const items = await economySystem.getMarketItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get market items" });
    }
  });

  app.post("/api/market/buy", async (req, res) => {
    try {
      const { userId, itemName, quantity } = req.body;
      const result = await economySystem.buyItem(userId, itemName, quantity);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Purchase failed" });
    }
  });

  app.post("/api/market/sell", async (req, res) => {
    try {
      const { userId, resourceId, quantity, pricePerUnit } = req.body;
      const result = await economySystem.sellResource(userId, resourceId, quantity, pricePerUnit);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Sale failed" });
    }
  });

  // Guild routes
  app.get("/api/guilds", async (req, res) => {
    try {
      const guilds = await storage.getAllGuilds();
      res.json(guilds);
    } catch (error) {
      res.status(500).json({ message: "Failed to get guilds" });
    }
  });

  app.post("/api/user/:userId/guild/join", async (req, res) => {
    try {
      const { guildId } = req.body;
      const result = await guildSystem.joinGuild(req.params.userId, guildId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to join guild" });
    }
  });

  app.post("/api/user/:userId/guild/contribute", async (req, res) => {
    try {
      const { resourceType, amount } = req.body;
      const result = await guildSystem.contribute(req.params.userId, resourceType, amount);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to contribute to guild" });
    }
  });

  // Alliance routes
  app.get("/api/alliances", async (req, res) => {
    try {
      const alliances = await storage.getUserAlliances();
      res.json(alliances);
    } catch (error) {
      res.status(500).json({ message: "Failed to get alliances" });
    }
  });

  app.post("/api/user/:userId/alliance/create", async (req, res) => {
    try {
      const { name, description } = req.body;
      const alliance = await storage.createAlliance({
        name,
        description,
        leaderId: req.params.userId
      });
      res.json(alliance);
    } catch (error) {
      res.status(400).json({ message: "Failed to create alliance" });
    }
  });

  // Crafting routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recipes" });
    }
  });

  app.post("/api/user/:userId/craft", async (req, res) => {
    try {
      const { recipeId } = req.body;
      const result = await economySystem.craftItem(req.params.userId, recipeId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Crafting failed" });
    }
  });

  // Resources routes
  app.get("/api/user/:userId/resources", async (req, res) => {
    try {
      const resources = await storage.getUserResources(req.params.userId);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to get resources" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
