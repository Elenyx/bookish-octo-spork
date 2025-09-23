import { storage } from '../storage';
import { gameEngine } from './gameEngine';
import { contentGenerator } from '../generators/contentGenerator';
import { rewardCalculator } from '../utils/rewardCalculator';

interface CombatResult {
  winner: string;
  attackerDamage: number;
  defenderDamage: number;
  rewards: Array<{ type: string; name: string; quantity: number; value: number }>;
  experience: number;
}

class CombatSystem {
  async pveCompat(userId: string, enemyType: string = 'random') {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const ships = await storage.getUserShips(userId);
    const activeShip = ships.find(ship => ship.isActive);
    if (!activeShip) {
      throw new Error('No active ship found');
    }

    const enemy = contentGenerator.generateEnemy(enemyType, user.level || 1);
    const result = this.simulateCombat(activeShip, enemy);

    // Calculate rewards based on victory
    const rewards = result.winner === 'player' ? 
      rewardCalculator.calculateCombatRewards(enemy.difficulty, user.level || 1) : [];

    // Apply ship damage
    const newHealth = Math.max(0, activeShip.health - result.defenderDamage);
    await storage.updateShip(activeShip.id, { health: newHealth });

    // Award experience and rewards
    await gameEngine.gainExperience(userId, result.experience);
    
    if (rewards.length > 0) {
      for (const reward of rewards) {
        if (reward.type === 'credits') {
          await storage.updateUser(userId, { 
            credits: (user.credits || 0) + reward.value 
          });
        } else if (reward.type === 'nexium') {
          await storage.updateUser(userId, { 
            nexium: (user.nexium || 0) + reward.quantity 
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

    // Log combat
    const combatLog = await storage.addCombatLog({
      attackerId: userId,
      defenderId: null,
      type: 'pve',
      result: {
        winner: result.winner === 'player' ? userId : 'enemy',
        attackerDamage: result.attackerDamage,
        defenderDamage: result.defenderDamage,
        rewards,
        experience: result.experience
      }
    });

    return {
      success: result.winner === 'player',
      enemy: enemy.name,
      result: combatLog.result,
      shipHealth: newHealth
    };
  }

  async pvpCombat(attackerId: string, defenderId: string) {
    if (attackerId === defenderId) {
      throw new Error('Cannot attack yourself');
    }

    const attacker = await storage.getUser(attackerId);
    const defender = await storage.getUser(defenderId);
    
    if (!attacker || !defender) {
      throw new Error('One or both users not found');
    }

    const attackerShips = await storage.getUserShips(attackerId);
    const defenderShips = await storage.getUserShips(defenderId);

    const attackerShip = attackerShips.find(ship => ship.isActive);
    const defenderShip = defenderShips.find(ship => ship.isActive);

    if (!attackerShip || !defenderShip) {
      throw new Error('One or both players do not have an active ship');
    }

    const result = this.simulatePlayerCombat(attackerShip, defenderShip);
    
    // Apply damage to both ships
    const attackerNewHealth = Math.max(0, attackerShip.health - result.attackerDamageReceived);
    const defenderNewHealth = Math.max(0, defenderShip.health - result.defenderDamageReceived);

    await storage.updateShip(attackerShip.id, { health: attackerNewHealth });
    await storage.updateShip(defenderShip.id, { health: defenderNewHealth });

    // Award experience to both players
    const winnerExp = 150;
    const loserExp = 50;
    
    if (result.winner === 'attacker') {
      await gameEngine.gainExperience(attackerId, winnerExp);
      await gameEngine.gainExperience(defenderId, loserExp);
    } else {
      await gameEngine.gainExperience(attackerId, loserExp);
      await gameEngine.gainExperience(defenderId, winnerExp);
    }

    // Log combat
    const combatLog = await storage.addCombatLog({
      attackerId,
      defenderId,
      type: 'pvp',
      result: {
        winner: result.winner === 'attacker' ? attackerId : defenderId,
        attackerDamage: result.attackerDamageDealt,
        defenderDamage: result.defenderDamageDealt,
        rewards: [],
        experience: result.winner === 'attacker' ? winnerExp : loserExp
      }
    });

    return {
      winner: result.winner,
      attackerShipHealth: attackerNewHealth,
      defenderShipHealth: defenderNewHealth,
      result: combatLog.result
    };
  }

  private simulateCombat(playerShip: any, enemy: any) {
    const playerPower = this.calculateShipPower(playerShip);
    const enemyPower = enemy.power;

    // Combat simulation with randomness
    const playerRoll = Math.random() * playerPower;
    const enemyRoll = Math.random() * enemyPower;

    const attackerDamage = Math.floor(playerRoll * 0.3 + playerShip.weapons * 10);
    const defenderDamage = Math.floor(enemyRoll * 0.2 + enemy.weapons * 8);

    const winner = playerRoll > enemyRoll ? 'player' : 'enemy';
    const experience = Math.floor(enemy.difficulty * 25 + (winner === 'player' ? 50 : 25));

    return {
      winner,
      attackerDamage,
      defenderDamage,
      experience
    };
  }

  private simulatePlayerCombat(attackerShip: any, defenderShip: any) {
    const attackerPower = this.calculateShipPower(attackerShip);
    const defenderPower = this.calculateShipPower(defenderShip);

    // PvP combat simulation
    const attackerRoll = Math.random() * attackerPower;
    const defenderRoll = Math.random() * defenderPower;

    const attackerDamageDealt = Math.floor(attackerRoll * 0.25 + attackerShip.weapons * 12);
    const defenderDamageDealt = Math.floor(defenderRoll * 0.25 + defenderShip.weapons * 12);

    // Counter-damage based on ship stats
    const attackerDamageReceived = Math.floor(defenderDamageDealt * (1 - attackerShip.speed / 200));
    const defenderDamageReceived = Math.floor(attackerDamageDealt * (1 - defenderShip.speed / 200));

    const winner = attackerRoll > defenderRoll ? 'attacker' : 'defender';

    return {
      winner,
      attackerDamageDealt,
      defenderDamageDealt,
      attackerDamageReceived,
      defenderDamageReceived
    };
  }

  private calculateShipPower(ship: any): number {
    return ship.health + ship.speed + ship.weapons * 20 + ship.sensors;
  }

  private determineRarity(value: number): string {
    if (value < 10) return 'common';
    if (value < 50) return 'uncommon';
    if (value < 200) return 'rare';
    if (value < 500) return 'epic';
    return 'legendary';
  }
}

export const combatSystem = new CombatSystem();
