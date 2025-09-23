import { storage } from '../storage';
import { gameEngine } from './gameEngine';
import { contentGenerator } from '../generators/contentGenerator';
import { rewardCalculator } from '../utils/rewardCalculator';

class ExplorationSystem {
  async explore(userId: string, type: string, sector: string = 'auto') {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const ships = await storage.getUserShips(userId);
    const activeShip = ships.find(ship => ship.isActive);
    if (!activeShip) {
      throw new Error('No active ship found');
    }

    // Generate sector if auto
    if (sector === 'auto') {
      sector = contentGenerator.generateSectorName();
    }

    const result = await this.performExploration(user, activeShip, type, sector);

    // Award experience
    await gameEngine.gainExperience(userId, result.experience);

    // Update user stats
    const newStats = {
      exploration: (user.stats?.exploration || 0) + 1,
      combat: user.stats?.combat || 0,
      artifacts: user.stats?.artifacts || 0,
      trades: user.stats?.trades || 0
    };
    await storage.updateUser(userId, { stats: newStats });

    // Add rewards to user inventory
    if (result.rewards && result.rewards.length > 0) {
      for (const reward of result.rewards) {
        if (reward.type === 'credits') {
          await storage.updateUser(userId, {
            credits: user.credits + reward.value
          });
        } else if (reward.type === 'nexium') {
          await storage.updateUser(userId, {
            nexium: user.nexium + reward.quantity
          });
        } else {
          await storage.addResource({
            userId,
            name: reward.name,
            type: reward.type,
            quantity: reward.quantity,
            rarity: this.determineRarity(reward.value),
            value: reward.value
          });
        }
      }
    }

    // Log exploration
    const exploration = await storage.addExploration({
      userId,
      sector,
      type,
      result
    });

    return exploration;
  }

  private async performExploration(user: any, ship: any, type: string, sector: string) {
    const shipBonus = this.calculateShipBonus(ship, type);
    const levelBonus = user.level * 0.1;
    const baseSuccessRate = this.getBaseSuccessRate(type);
    
    const finalSuccessRate = Math.min(0.95, baseSuccessRate + shipBonus + levelBonus);
    const success = Math.random() < finalSuccessRate;

    const experience = this.calculateExperience(type, success, user.level);
    let rewards: any[] = [];

    if (success) {
      rewards = rewardCalculator.calculateExplorationRewards(type, user.level, ship.sensors);
    } else {
      // Consolation rewards for failed exploration
      rewards = [{
        type: 'credits',
        name: 'Salvage',
        quantity: 1,
        value: Math.floor(Math.random() * 20) + 10
      }];
    }

    return {
      success,
      rewards,
      experience,
      shipBonus,
      sectorData: contentGenerator.generateSectorData(sector)
    };
  }

  private calculateShipBonus(ship: any, type: string): number {
    switch (type) {
      case 'exploration':
        return ship.sensors * 0.001; // Sensors help with exploration
      case 'hunting':
        return ship.weapons * 0.002; // Weapons help with hunting
      case 'artifact_search':
        return (ship.sensors + ship.cargo) * 0.0015; // Sensors and cargo help
      case 'fishing':
        return ship.speed * 0.001; // Speed helps with fishing
      default:
        return 0;
    }
  }

  private getBaseSuccessRate(type: string): number {
    const baseRates = {
      exploration: 0.7,
      hunting: 0.6,
      artifact_search: 0.4,
      fishing: 0.8
    };
    return baseRates[type as keyof typeof baseRates] || 0.5;
  }

  private calculateExperience(type: string, success: boolean, userLevel: number): number {
    const baseExp = {
      exploration: 30,
      hunting: 40,
      artifact_search: 60,
      fishing: 20
    };

    const exp = baseExp[type as keyof typeof baseExp] || 25;
    const multiplier = success ? 1.5 : 0.5;
    const levelBonus = userLevel * 2;

    return Math.floor(exp * multiplier + levelBonus);
  }

  private determineRarity(value: number): string {
    if (value < 20) return 'common';
    if (value < 100) return 'uncommon';
    if (value < 300) return 'rare';
    if (value < 700) return 'epic';
    return 'legendary';
  }

  async getExplorationHistory(userId: string, limit: number = 10) {
    return await storage.getUserExplorations(userId, limit);
  }

  async getAvailableSectors(userLevel: number) {
    return contentGenerator.generateAvailableSectors(userLevel);
  }
}

export const explorationSystem = new ExplorationSystem();
