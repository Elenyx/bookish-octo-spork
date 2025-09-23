import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  boolean, 
  timestamp, 
  json,
  serial,
  real
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: varchar("discord_id").notNull().unique(),
  username: text("username").notNull(),
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  credits: integer("credits").default(1000),
  nexium: integer("nexium").default(25),
  activeShipId: varchar("active_ship_id"),
  guildId: varchar("guild_id"),
  allianceId: varchar("alliance_id"),
  stats: json("stats").$type<{
    exploration: number;
    combat: number;
    artifacts: number;
    trades: number;
  }>().default({ exploration: 0, combat: 0, artifacts: 0, trades: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow()
});

// Ships table
export const ships = pgTable("ships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // scout, fighter, freighter, explorer, battlecruiser, flagship
  tier: integer("tier").notNull(), // 1-4
  variant: text("variant").notNull(), // Swiftwing, Spectre, etc.
  health: integer("health").notNull(),
  maxHealth: integer("max_health").notNull(),
  speed: integer("speed").notNull(),
  cargo: integer("cargo").notNull(),
  weapons: integer("weapons").notNull(),
  sensors: integer("sensors").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Resources table
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // material, artifact, component
  quantity: integer("quantity").default(1),
  rarity: text("rarity").notNull(), // common, uncommon, rare, epic, legendary
  description: text("description"),
  value: integer("value").default(0)
});

// Guilds table
export const guilds = pgTable("guilds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // military, exploration, trade, research
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  memberCount: integer("member_count").default(0),
  maxMembers: integer("max_members").default(100),
  leaderId: varchar("leader_id"), // NPC leader
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

// Alliances table
export const alliances = pgTable("alliances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  leaderId: varchar("leader_id").notNull().references(() => users.id),
  memberCount: integer("member_count").default(1),
  maxMembers: integer("max_members").default(20),
  fleetPower: integer("fleet_power").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Exploration data
export const explorations = pgTable("explorations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sector: text("sector").notNull(),
  type: text("type").notNull(), // exploration, hunting, fishing, artifact_search
  result: json("result").$type<{
    success: boolean;
    rewards: Array<{ type: string; name: string; quantity: number; value: number }>;
    experience: number;
  }>(),
  timestamp: timestamp("timestamp").defaultNow()
});

// Combat logs
export const combatLogs = pgTable("combat_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  attackerId: varchar("attacker_id").notNull().references(() => users.id),
  defenderId: varchar("defender_id"), // null for PvE
  type: text("type").notNull(), // pve, pvp
  result: json("result").$type<{
    winner: string;
    attackerDamage: number;
    defenderDamage: number;
    rewards: Array<{ type: string; name: string; quantity: number; value: number }>;
    experience: number;
  }>(),
  timestamp: timestamp("timestamp").defaultNow()
});

// Market transactions
export const marketTransactions = pgTable("market_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id"), // null for NPC transactions
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  itemType: text("item_type").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: integer("price_per_unit").notNull(),
  totalPrice: integer("total_price").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});

// Crafting recipes
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // weapon, component, upgrade
  materials: json("materials").$type<Array<{ name: string; quantity: number }>>(),
  result: json("result").$type<{ name: string; quantity: number; stats?: any }>(),
  level: integer("level").default(1),
  rarity: text("rarity").notNull()
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  ships: many(ships),
  resources: many(resources),
  guild: one(guilds, { fields: [users.guildId], references: [guilds.id] }),
  alliance: one(alliances, { fields: [users.allianceId], references: [alliances.id] }),
  explorations: many(explorations),
  combatLogs: many(combatLogs, { relationName: "attacker" }),
  marketTransactions: many(marketTransactions)
}));

export const shipsRelations = relations(ships, ({ one }) => ({
  user: one(users, { fields: [ships.userId], references: [users.id] })
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  user: one(users, { fields: [resources.userId], references: [users.id] })
}));

export const guildsRelations = relations(guilds, ({ many }) => ({
  members: many(users)
}));

export const alliancesRelations = relations(alliances, ({ one, many }) => ({
  leader: one(users, { fields: [alliances.leaderId], references: [users.id] }),
  members: many(users)
}));

export const explorationsRelations = relations(explorations, ({ one }) => ({
  user: one(users, { fields: [explorations.userId], references: [users.id] })
}));

export const combatLogsRelations = relations(combatLogs, ({ one }) => ({
  attacker: one(users, { fields: [combatLogs.attackerId], references: [users.id], relationName: "attacker" })
}));

export const marketTransactionsRelations = relations(marketTransactions, ({ one }) => ({
  buyer: one(users, { fields: [marketTransactions.buyerId], references: [users.id] })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true
});

export const insertShipSchema = createInsertSchema(ships).omit({
  id: true,
  createdAt: true
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true
});

export const insertGuildSchema = createInsertSchema(guilds).omit({
  id: true,
  createdAt: true
});

export const insertAllianceSchema = createInsertSchema(alliances).omit({
  id: true,
  createdAt: true
});

export const insertExplorationSchema = createInsertSchema(explorations).omit({
  id: true,
  timestamp: true
});

export const insertCombatLogSchema = createInsertSchema(combatLogs).omit({
  id: true,
  timestamp: true
});

export const insertMarketTransactionSchema = createInsertSchema(marketTransactions).omit({
  id: true,
  timestamp: true
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Ship = typeof ships.$inferSelect;
export type InsertShip = z.infer<typeof insertShipSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = z.infer<typeof insertGuildSchema>;
export type Alliance = typeof alliances.$inferSelect;
export type InsertAlliance = z.infer<typeof insertAllianceSchema>;
export type Exploration = typeof explorations.$inferSelect;
export type InsertExploration = z.infer<typeof insertExplorationSchema>;
export type CombatLog = typeof combatLogs.$inferSelect;
export type InsertCombatLog = z.infer<typeof insertCombatLogSchema>;
export type MarketTransaction = typeof marketTransactions.$inferSelect;
export type InsertMarketTransaction = z.infer<typeof insertMarketTransactionSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
