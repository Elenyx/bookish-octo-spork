import { apiRequest } from "./queryClient";

export const gameApi = {
  // User operations
  async getUser(discordId: string) {
    const response = await apiRequest('GET', `/api/user/${discordId}`);
    return response.json();
  },

  async registerUser(discordId: string, username: string) {
    const response = await apiRequest('POST', '/api/user/register', {
      discordId,
      username,
      level: 1,
      experience: 0,
      credits: 1000,
      nexium: 25,
      stats: { exploration: 0, combat: 0, artifacts: 0, trades: 0 }
    });
    return response.json();
  },

  // Ship operations
  async getUserShips(userId: string) {
    const response = await apiRequest('GET', `/api/user/${userId}/ships`);
    return response.json();
  },

  async activateShip(userId: string, shipId: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/ship/activate`, {
      shipId
    });
    return response.json();
  },

  async upgradeShip(userId: string, shipId: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/ship/upgrade`, {
      shipId
    });
    return response.json();
  },

  // Exploration operations
  async explore(userId: string, type: string, sector?: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/explore`, {
      type,
      sector: sector || 'auto'
    });
    return response.json();
  },

  async getUserExplorations(userId: string, limit = 10) {
    const response = await apiRequest('GET', `/api/user/${userId}/explorations?limit=${limit}`);
    return response.json();
  },

  // Combat operations
  async pveCombat(userId: string, enemyType: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/combat/pve`, {
      enemyType
    });
    return response.json();
  },

  async pvpCombat(userId: string, targetUserId: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/combat/pvp`, {
      targetUserId
    });
    return response.json();
  },

  // Market operations
  async getMarketItems() {
    const response = await apiRequest('GET', '/api/market/items');
    return response.json();
  },

  async buyItem(userId: string, itemName: string, quantity: number) {
    const response = await apiRequest('POST', '/api/market/buy', {
      userId,
      itemName,
      quantity
    });
    return response.json();
  },

  async sellResource(userId: string, resourceId: string, quantity: number, pricePerUnit: number) {
    const response = await apiRequest('POST', '/api/market/sell', {
      userId,
      resourceId,
      quantity,
      pricePerUnit
    });
    return response.json();
  },

  // Guild operations
  async getGuilds() {
    const response = await apiRequest('GET', '/api/guilds');
    return response.json();
  },

  async joinGuild(userId: string, guildId: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/guild/join`, {
      guildId
    });
    return response.json();
  },

  async contributeToGuild(userId: string, resourceType: string, amount: number) {
    const response = await apiRequest('POST', `/api/user/${userId}/guild/contribute`, {
      resourceType,
      amount
    });
    return response.json();
  },

  // Alliance operations
  async getAlliances() {
    const response = await apiRequest('GET', '/api/alliances');
    return response.json();
  },

  async createAlliance(userId: string, name: string, description: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/alliance/create`, {
      name,
      description
    });
    return response.json();
  },

  // Crafting operations
  async getRecipes() {
    const response = await apiRequest('GET', '/api/recipes');
    return response.json();
  },

  async craftItem(userId: string, recipeId: string) {
    const response = await apiRequest('POST', `/api/user/${userId}/craft`, {
      recipeId
    });
    return response.json();
  },

  // Resource operations
  async getUserResources(userId: string) {
    const response = await apiRequest('GET', `/api/user/${userId}/resources`);
    return response.json();
  }
};
