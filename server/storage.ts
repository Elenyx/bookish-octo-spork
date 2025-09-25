import { 
  users, ships, resources, guilds, alliances, explorations, 
  combatLogs, marketTransactions, recipes,
  type User, type InsertUser, type Ship, type InsertShip,
  type Resource, type InsertResource, type Guild, type InsertGuild,
  type Alliance, type InsertAlliance, type Exploration, type InsertExploration,
  type CombatLog, type InsertCombatLog, type MarketTransaction, 
  type InsertMarketTransaction, type Recipe, type InsertRecipe
} from "./shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Ship operations
  getShip(id: string): Promise<Ship | undefined>;
  getUserShips(userId: string): Promise<Ship[]>;
  createShip(ship: InsertShip): Promise<Ship>;
  updateShip(id: string, updates: Partial<Ship>): Promise<Ship>;
  setActiveShip(userId: string, shipId: string): Promise<void>;

  // Resource operations
  getUserResources(userId: string): Promise<Resource[]>;
  addResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
  removeResource(id: string): Promise<void>;

  // Guild operations
  getGuild(id: string): Promise<Guild | undefined>;
  getAllGuilds(): Promise<Guild[]>;
  createGuild(guild: InsertGuild): Promise<Guild>;
  updateGuild(id: string, updates: Partial<Guild>): Promise<Guild>;
  getGuildMembers(guildId: string): Promise<User[]>;

  // Alliance operations
  getAlliance(id: string): Promise<Alliance | undefined>;
  getUserAlliances(): Promise<Alliance[]>;
  createAlliance(alliance: InsertAlliance): Promise<Alliance>;
  updateAlliance(id: string, updates: Partial<Alliance>): Promise<Alliance>;
  getAllianceMembers(allianceId: string): Promise<User[]>;

  // Exploration operations
  addExploration(exploration: InsertExploration): Promise<Exploration>;
  getUserExplorations(userId: string, limit?: number): Promise<Exploration[]>;

  // Combat operations
  addCombatLog(combat: InsertCombatLog): Promise<CombatLog>;
  getUserCombatHistory(userId: string, limit?: number): Promise<CombatLog[]>;

  // Market operations
  addMarketTransaction(transaction: InsertMarketTransaction): Promise<MarketTransaction>;
  getMarketHistory(limit?: number): Promise<MarketTransaction[]>;

  // Recipe operations
  getAllRecipes(): Promise<Recipe[]>;
  getRecipesByType(type: string): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
  const [user] = (await db.insert(users).values(insertUser).returning()) as unknown as User[];
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getShip(id: string): Promise<Ship | undefined> {
    const [ship] = await db.select().from(ships).where(eq(ships.id, id));
    return ship || undefined;
  }

  async getUserShips(userId: string): Promise<Ship[]> {
    return await db.select().from(ships).where(eq(ships.userId, userId));
  }

  async createShip(ship: InsertShip): Promise<Ship> {
    const [newShip] = (await db.insert(ships).values(ship).returning()) as unknown as Ship[];
    return newShip;
  }

  async updateShip(id: string, updates: Partial<Ship>): Promise<Ship> {
    const [ship] = await db.update(ships).set(updates).where(eq(ships.id, id)).returning();
    return ship;
  }

  async setActiveShip(userId: string, shipId: string): Promise<void> {
    // First deactivate all ships for the user
    await db.update(ships).set({ isActive: false }).where(eq(ships.userId, userId));
    // Then activate the selected ship
    await db.update(ships).set({ isActive: true }).where(eq(ships.id, shipId));
    // Update user's active ship reference
    await db.update(users).set({ activeShipId: shipId }).where(eq(users.id, userId));
  }

  async getUserResources(userId: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.userId, userId));
  }

  async addResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = (await db.insert(resources).values(resource).returning()) as unknown as Resource[];
    return newResource;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    const [resource] = await db.update(resources).set(updates).where(eq(resources.id, id)).returning();
    return resource;
  }

  async removeResource(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  async getGuild(id: string): Promise<Guild | undefined> {
    const [guild] = await db.select().from(guilds).where(eq(guilds.id, id));
    return guild || undefined;
  }

  async getAllGuilds(): Promise<Guild[]> {
    return await db.select().from(guilds);
  }

  async createGuild(guild: InsertGuild): Promise<Guild> {
    const [newGuild] = (await db.insert(guilds).values(guild).returning()) as unknown as Guild[];
    return newGuild;
  }

  async updateGuild(id: string, updates: Partial<Guild>): Promise<Guild> {
    const [guild] = await db.update(guilds).set(updates).where(eq(guilds.id, id)).returning();
    return guild;
  }

  async getGuildMembers(guildId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.guildId, guildId));
  }

  async getAlliance(id: string): Promise<Alliance | undefined> {
    const [alliance] = await db.select().from(alliances).where(eq(alliances.id, id));
    return alliance || undefined;
  }

  async getUserAlliances(): Promise<Alliance[]> {
    return await db.select().from(alliances);
  }

  async createAlliance(alliance: InsertAlliance): Promise<Alliance> {
    const [newAlliance] = (await db.insert(alliances).values(alliance).returning()) as unknown as Alliance[];
    return newAlliance;
  }

  async updateAlliance(id: string, updates: Partial<Alliance>): Promise<Alliance> {
    const [alliance] = await db.update(alliances).set(updates).where(eq(alliances.id, id)).returning();
    return alliance;
  }

  async getAllianceMembers(allianceId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.allianceId, allianceId));
  }

  async addExploration(exploration: InsertExploration): Promise<Exploration> {
    const [newExploration] = (await db.insert(explorations).values([exploration]).returning()) as unknown as Exploration[];
    return newExploration;
  }

  async getUserExplorations(userId: string, limit = 10): Promise<Exploration[]> {
    return await db.select().from(explorations)
      .where(eq(explorations.userId, userId))
      .orderBy(desc(explorations.timestamp))
      .limit(limit);
  }

  async addCombatLog(combat: InsertCombatLog): Promise<CombatLog> {
    const [newCombat] = (await db.insert(combatLogs).values([combat]).returning()) as unknown as CombatLog[];
    return newCombat;
  }

  async getUserCombatHistory(userId: string, limit = 10): Promise<CombatLog[]> {
    return await db.select().from(combatLogs)
      .where(eq(combatLogs.attackerId, userId))
      .orderBy(desc(combatLogs.timestamp))
      .limit(limit);
  }

  async addMarketTransaction(transaction: InsertMarketTransaction): Promise<MarketTransaction> {
    const [newTransaction] = (await db.insert(marketTransactions).values(transaction).returning()) as unknown as MarketTransaction[];
    return newTransaction;
  }

  async getMarketHistory(limit = 50): Promise<MarketTransaction[]> {
    return await db.select().from(marketTransactions)
      .orderBy(desc(marketTransactions.timestamp))
      .limit(limit);
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipesByType(type: string): Promise<Recipe[]> {
    return await db.select().from(recipes).where(eq(recipes.type, type));
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = (await db.insert(recipes).values([recipe]).returning()) as unknown as Recipe[];
    return newRecipe;
  }
}

export const storage = new DatabaseStorage();
