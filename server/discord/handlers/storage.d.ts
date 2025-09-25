declare module '../../storage' {
  export function getUserByDiscordId(discordId: string): Promise<{ id: string } | null>;
  export function getUserShips(userId: string): Promise<any[]>;
  export function getUserResources(userId: string): Promise<any[]>;
  export function setActiveShip(userId: string, shipId: string): Promise<void>;
  export function getShip(shipId: string): Promise<any | null>;
  export function updateUser(userId: string, updates: any): Promise<void>;
}
