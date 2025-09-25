declare module '@shared/schema' {
  // Minimal stubs for runtime tables/collections used by storage.ts
  export const users: any;
  export const ships: any;
  export const resources: any;
  export const guilds: any;
  export const alliances: any;
  export const explorations: any;
  export const combatLogs: any;
  export const marketTransactions: any;
  export const recipes: any;

  // Basic type aliases
  export type User = any;
  export type InsertUser = any;
  export type Ship = any;
  export type InsertShip = any;
  export type Resource = any;
  export type InsertResource = any;
  export type Guild = any;
  export type InsertGuild = any;
  export type Alliance = any;
  export type InsertAlliance = any;
  export type Exploration = any;
  export type InsertExploration = any;
  export type CombatLog = any;
  export type InsertCombatLog = any;
  export type MarketTransaction = any;
  export type InsertMarketTransaction = any;
  export type Recipe = any;
  export type InsertRecipe = any;

  // Fallback for any other named exports
  export const __any: any;
}
