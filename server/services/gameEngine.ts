import { storage } from '../storage';
import { InsertUser, InsertShip } from '../shared/schema';
import { contentGenerator } from '../generators/contentGenerator';
import { rewardCalculator } from '../utils/rewardCalculator';

// Ship tier configurations from the attached file
type ShipTierConfig = {
  variant: string;
  health: number;
  speed: number;
  cargo: number;
  weapons: number;
  sensors: number;
  cost: number;
  nexium?: number;
};

const SHIP_CONFIGS: Record<string, Record<number, ShipTierConfig>> = {
  scout: {
    1: { variant: 'Swiftwing', health: 100, speed: 80, cargo: 20, weapons: 1, sensors: 60, cost: 0 },
    2: { variant: 'Spectre', health: 120, speed: 90, cargo: 25, weapons: 1, sensors: 70, cost: 500, nexium: 10 },
    3: { variant: 'Phantom', health: 140, speed: 100, cargo: 30, weapons: 2, sensors: 80, cost: 1200, nexium: 25 },
    4: { variant: 'Celestial Whisper', health: 160, speed: 110, cargo: 35, weapons: 2, sensors: 90, cost: 2500, nexium: 50 }
  },
  fighter: {
    1: { variant: 'Vindicator', health: 150, speed: 70, cargo: 15, weapons: 3, sensors: 40, cost: 0 },
    2: { variant: 'Gladiator', health: 180, speed: 75, cargo: 18, weapons: 4, sensors: 45, cost: 600, nexium: 15 },
    3: { variant: 'Annihilator', health: 210, speed: 80, cargo: 21, weapons: 5, sensors: 50, cost: 1400, nexium: 30 },
    4: { variant: 'Dominator', health: 240, speed: 85, cargo: 24, weapons: 6, sensors: 55, cost: 3000, nexium: 60 }
  },
  freighter: {
    1: { variant: 'Hauler', health: 200, speed: 50, cargo: 100, weapons: 1, sensors: 30, cost: 0 },
    2: { variant: 'Bulkhead', health: 240, speed: 55, cargo: 125, weapons: 1, sensors: 35, cost: 700, nexium: 20 },
    3: { variant: 'Citadel', health: 280, speed: 60, cargo: 150, weapons: 2, sensors: 40, cost: 1600, nexium: 35 },
    4: { variant: 'Goliath', health: 320, speed: 65, cargo: 175, weapons: 2, sensors: 45, cost: 3500, nexium: 70 }
  },
  explorer: {
    1: { variant: 'Pathfinder', health: 120, speed: 60, cargo: 40, weapons: 2, sensors: 80, cost: 0 },
    2: { variant: 'Horizon Seeker', health: 140, speed: 65, cargo: 50, weapons: 2, sensors: 90, cost: 550, nexium: 12 },
    3: { variant: 'Nebula Navigator', health: 160, speed: 70, cargo: 60, weapons: 3, sensors: 100, cost: 1300, nexium: 28 },
    4: { variant: 'Event Horizon', health: 180, speed: 75, cargo: 70, weapons: 3, sensors: 110, cost: 2800, nexium: 55 }
  },
  battlecruiser: {
    1: { variant: 'Warden', health: 300, speed: 40, cargo: 30, weapons: 5, sensors: 50, cost: 0 },
    2: { variant: 'Juggernaut', health: 360, speed: 42, cargo: 35, weapons: 6, sensors: 55, cost: 800, nexium: 18 },
    3: { variant: 'Dreadnought', health: 420, speed: 44, cargo: 40, weapons: 7, sensors: 60, cost: 1800, nexium: 40 },
    4: { variant: 'Behemoth', health: 480, speed: 46, cargo: 45, weapons: 8, sensors: 65, cost: 4000, nexium: 80 }
  },
  flagship: {
    1: { variant: 'Sovereign', health: 250, speed: 55, cargo: 50, weapons: 4, sensors: 70, cost: 0 },
    2: { variant: 'Paragon', health: 300, speed: 58, cargo: 60, weapons: 5, sensors: 75, cost: 750, nexium: 16 },
    3: { variant: 'Leviathan', health: 350, speed: 61, cargo: 70, weapons: 6, sensors: 80, cost: 1700, nexium: 38 },
    4: { variant: 'Imperator', health: 400, speed: 64, cargo: 80, weapons: 7, sensors: 85, cost: 3800, nexium: 75 }
  }
};

class GameEngine {
  async registerUser(userData: InsertUser) {
    const user = await storage.createUser(userData);
    
    // Create starting ship (Swiftwing Scout)
    const startingShip = await this.createStartingShip(user.id);
    
    // Set the starting ship as active
    await storage.setActiveShip(user.id, startingShip.id);
    
    // Add starting resources
    await this.giveStartingResources(user.id);
    
    return user;
  }

  private async createStartingShip(userId: string): Promise<any> {
    const shipConfig = SHIP_CONFIGS.scout[1];
    
    const shipData: InsertShip = {
      userId,
      name: `${shipConfig.variant}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'scout',
      tier: 1,
      variant: shipConfig.variant,
      health: shipConfig.health,
      maxHealth: shipConfig.health,
      speed: shipConfig.speed,
      cargo: shipConfig.cargo,
      weapons: shipConfig.weapons,
      sensors: shipConfig.sensors,
      isActive: true
    };

    return await storage.createShip(shipData);
  }

  private async giveStartingResources(userId: string) {
    const startingResources = [
      { name: 'Iron Ore', type: 'material', quantity: 10, rarity: 'common', value: 5 },
      { name: 'Energy Cell', type: 'component', quantity: 5, rarity: 'common', value: 15 },
      { name: 'Basic Alloy', type: 'material', quantity: 3, rarity: 'uncommon', value: 25 }
    ];

    for (const resource of startingResources) {
      await storage.addResource({
        userId,
        ...resource
      });
    }
  }

  async upgradeShip(userId: string, shipId: string) {
    const ship = await storage.getShip(shipId);
    if (!ship || ship.userId !== userId) {
      throw new Error('Ship not found or not owned by user');
    }

    if (ship.tier >= 4) {
      throw new Error('Ship is already at maximum tier');
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const shipType = ship.type as keyof typeof SHIP_CONFIGS;
    const nextTier = (ship.tier + 1) as 1 | 2 | 3 | 4;
    const upgradeConfig = SHIP_CONFIGS[shipType][nextTier];

    // Check if user has enough resources
    if ((user.credits || 0) < upgradeConfig.cost) {
      throw new Error('Insufficient credits');
    }
    if (typeof upgradeConfig.nexium === 'number' && (user.nexium || 0) < upgradeConfig.nexium) {
      throw new Error('Insufficient nexium crystals');
    }

    // Deduct resources
    const updateData: Partial<typeof user> = {
      credits: (user.credits || 0) - upgradeConfig.cost
    };
    if (typeof upgradeConfig.nexium === 'number') {
      (updateData as any).nexium = (user.nexium || 0) - upgradeConfig.nexium;
    }
    await storage.updateUser(userId, updateData);

    // Upgrade ship
    const upgradedShip = await storage.updateShip(shipId, {
      tier: nextTier,
      variant: upgradeConfig.variant,
      health: upgradeConfig.health,
      maxHealth: upgradeConfig.health,
      speed: upgradeConfig.speed,
      cargo: upgradeConfig.cargo,
      weapons: upgradeConfig.weapons,
      sensors: upgradeConfig.sensors
    });

    return {
      success: true,
      ship: upgradedShip,
      costPaid: { 
        credits: upgradeConfig.cost, 
  nexium: upgradeConfig.nexium || 0 
      }
    };
  }

  async purchaseShip(userId: string, shipType: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!(shipType in SHIP_CONFIGS)) {
      throw new Error('Invalid ship type');
    }

    const shipConfig = SHIP_CONFIGS[shipType as keyof typeof SHIP_CONFIGS][1];
    const baseCost = this.getShipBaseCost(shipType);

    if ((user.credits || 0) < baseCost) {
      throw new Error('Insufficient credits');
    }

    // Deduct cost
    await storage.updateUser(userId, {
      credits: (user.credits || 0) - baseCost
    });

    // Create new ship
    const shipData: InsertShip = {
      userId,
      name: `${shipConfig.variant}-${Math.random().toString(36).substr(2, 4)}`,
      type: shipType,
      tier: 1,
      variant: shipConfig.variant,
      health: shipConfig.health,
      maxHealth: shipConfig.health,
      speed: shipConfig.speed,
      cargo: shipConfig.cargo,
      weapons: shipConfig.weapons,
      sensors: shipConfig.sensors,
      isActive: false
    };

    const newShip = await storage.createShip(shipData);

    return {
      success: true,
      ship: newShip,
      costPaid: baseCost
    };
  }

  private getShipBaseCost(shipType: string): number {
    const baseCosts = {
      scout: 0, // Free starting ship
      fighter: 5000,
      freighter: 8000,
      explorer: 6000,
      battlecruiser: 15000,
      flagship: 25000
    };
    return baseCosts[shipType as keyof typeof baseCosts] || 1000;
  }

  async repairShip(userId: string, shipId: string) {
    const ship = await storage.getShip(shipId);
    if (!ship || ship.userId !== userId) {
      throw new Error('Ship not found or not owned by user');
    }

    if (ship.health >= ship.maxHealth) {
      throw new Error('Ship is already at full health');
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const repairCost = Math.floor((ship.maxHealth - ship.health) * 10);
    
    if ((user.credits || 0) < repairCost) {
      throw new Error('Insufficient credits for repair');
    }

    await storage.updateUser(userId, {
      credits: (user.credits || 0) - repairCost
    });

    const repairedShip = await storage.updateShip(shipId, {
      health: ship.maxHealth
    });

    return {
      success: true,
      ship: repairedShip,
      repairCost
    };
  }

  async gainExperience(userId: string, amount: number) {
    const user = await storage.getUser(userId);
    if (!user) return;

    const newExperience = (user.experience || 0) + amount;
    const newLevel = Math.floor(newExperience / 1000) + 1;
    
    const leveledUp = newLevel > (user.level || 1);

    await storage.updateUser(userId, {
      experience: newExperience,
      level: newLevel
    });

    return {
      experienceGained: amount,
      newLevel,
      leveledUp,
      rewards: leveledUp ? rewardCalculator.calculateLevelUpRewards(newLevel) : []
    };
  }
}

export const gameEngine = new GameEngine();
