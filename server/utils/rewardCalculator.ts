interface Reward {
  type: string;
  name: string;
  quantity: number;
  value: number;
}

class RewardCalculator {
  calculateExplorationRewards(explorationType: string, userLevel: number, sensorPower: number): Reward[] {
    const rewards: Reward[] = [];
    const levelMultiplier = 1 + (userLevel - 1) * 0.1;
    const sensorMultiplier = 1 + (sensorPower - 50) * 0.005; // Sensors above 50 provide bonus
    
    switch (explorationType) {
      case 'exploration':
        rewards.push(...this.generateExplorationRewards(levelMultiplier, sensorMultiplier));
        break;
      case 'hunting':
        rewards.push(...this.generateHuntingRewards(levelMultiplier));
        break;
      case 'artifact_search':
        rewards.push(...this.generateArtifactRewards(levelMultiplier, sensorMultiplier));
        break;
      case 'fishing':
        rewards.push(...this.generateFishingRewards(levelMultiplier));
        break;
      default:
        rewards.push(this.generateBasicReward(levelMultiplier));
    }
    
    return rewards;
  }

  calculateCombatRewards(enemyDifficulty: number, userLevel: number): Reward[] {
    const rewards: Reward[] = [];
    const difficultyMultiplier = 1 + enemyDifficulty * 0.2;
    const levelMultiplier = 1 + (userLevel - 1) * 0.05;
    
    // Always give credits
    const creditReward = Math.floor((50 + Math.random() * 100) * difficultyMultiplier * levelMultiplier);
    rewards.push({
      type: 'credits',
      name: 'Combat Pay',
      quantity: 1,
      value: creditReward
    });
    
    // Chance for materials based on difficulty
    const materialChance = Math.min(0.8, 0.3 + enemyDifficulty * 0.1);
    if (Math.random() < materialChance) {
      rewards.push(...this.generateCombatMaterials(difficultyMultiplier, levelMultiplier));
    }
    
    // Rare chance for nexium
    if (Math.random() < 0.2) {
      const nexiumAmount = Math.floor((1 + Math.random() * 3) * difficultyMultiplier);
      rewards.push({
        type: 'nexium',
        name: 'Nexium Crystal',
        quantity: nexiumAmount,
        value: nexiumAmount * 100
      });
    }
    
    return rewards;
  }

  calculateLevelUpRewards(level: number): Reward[] {
    const rewards: Reward[] = [];
    
    // Credits reward
    const creditAmount = level * 100 + Math.floor(Math.random() * level * 50);
    rewards.push({
      type: 'credits',
      name: 'Level Up Bonus',
      quantity: 1,
      value: creditAmount
    });
    
    // Nexium every 5 levels
    if (level % 5 === 0) {
      const nexiumAmount = Math.floor(level / 5) + Math.floor(Math.random() * 3);
      rewards.push({
        type: 'nexium',
        name: 'Milestone Nexium',
        quantity: nexiumAmount,
        value: nexiumAmount * 100
      });
    }
    
    // Special rewards at certain levels
    if (level === 10) {
      rewards.push({
        type: 'component',
        name: 'Advanced Navigation System',
        quantity: 1,
        value: 500
      });
    } else if (level === 20) {
      rewards.push({
        type: 'upgrade',
        name: 'Elite Pilot License',
        quantity: 1,
        value: 1000
      });
    } else if (level === 50) {
      rewards.push({
        type: 'artifact',
        name: 'Commander\'s Insignia',
        quantity: 1,
        value: 5000
      });
    }
    
    return rewards;
  }

  calculateQuestRewards(questDifficulty: number, questLength: number, userLevel: number): Reward[] {
    const rewards: Reward[] = [];
    const baseMultiplier = questDifficulty * questLength * (1 + userLevel * 0.05);
    
    // Base credit reward
    const credits = Math.floor((200 + Math.random() * 300) * baseMultiplier);
    rewards.push({
      type: 'credits',
      name: 'Quest Completion',
      quantity: 1,
      value: credits
    });
    
    // Experience (handled separately in game logic)
    const experience = Math.floor((100 + Math.random() * 200) * baseMultiplier);
    rewards.push({
      type: 'experience',
      name: 'Quest Experience',
      quantity: experience,
      value: 0
    });
    
    // Chance for special rewards based on difficulty
    if (questDifficulty >= 3) {
      rewards.push(...this.generateSpecialQuestRewards(baseMultiplier));
    }
    
    return rewards;
  }

  private generateExplorationRewards(levelMultiplier: number, sensorMultiplier: number): Reward[] {
    const rewards: Reward[] = [];
    const totalMultiplier = levelMultiplier * sensorMultiplier;
    
    // Credits from exploration
    const credits = Math.floor((30 + Math.random() * 70) * totalMultiplier);
    rewards.push({
      type: 'credits',
      name: 'Exploration Data',
      quantity: 1,
      value: credits
    });
    
    // Common materials
    const materials = ['Iron Ore', 'Silicon', 'Carbon Fiber', 'Aluminum'];
    const materialName = materials[Math.floor(Math.random() * materials.length)];
    const quantity = Math.floor((2 + Math.random() * 4) * levelMultiplier);
    
    rewards.push({
      type: 'material',
      name: materialName,
      quantity,
      value: quantity * 5
    });
    
    // Chance for rare discovery
    if (Math.random() < 0.3 * sensorMultiplier) {
      const rareFinds = ['Energy Crystal', 'Rare Metals', 'Quantum Fragment'];
      const rareName = rareFinds[Math.floor(Math.random() * rareFinds.length)];
      rewards.push({
        type: 'artifact',
        name: rareName,
        quantity: 1,
        value: Math.floor(100 * totalMultiplier)
      });
    }
    
    return rewards;
  }

  private generateHuntingRewards(levelMultiplier: number): Reward[] {
    const rewards: Reward[] = [];
    
    // Credits from hunting
    const credits = Math.floor((40 + Math.random() * 80) * levelMultiplier);
    rewards.push({
      type: 'credits',
      name: 'Bounty Payment',
      quantity: 1,
      value: credits
    });
    
    // Hunting materials
    const huntMaterials = ['Organic Compounds', 'Protein Synthesis', 'Biomass', 'Genetic Samples'];
    const materialName = huntMaterials[Math.floor(Math.random() * huntMaterials.length)];
    const quantity = Math.floor((1 + Math.random() * 3) * levelMultiplier);
    
    rewards.push({
      type: 'material',
      name: materialName,
      quantity,
      value: quantity * 15
    });
    
    // Rare hunting trophy
    if (Math.random() < 0.2) {
      rewards.push({
        type: 'artifact',
        name: 'Rare Trophy',
        quantity: 1,
        value: Math.floor(200 * levelMultiplier)
      });
    }
    
    return rewards;
  }

  private generateArtifactRewards(levelMultiplier: number, sensorMultiplier: number): Reward[] {
    const rewards: Reward[] = [];
    const totalMultiplier = levelMultiplier * sensorMultiplier;
    
    // Higher chance for valuable finds
    if (Math.random() < 0.6) {
      const artifacts = [
        'Ancient Data Core', 'Alien Technology Fragment', 'Quantum Artifact',
        'Temporal Resonator', 'Dimensional Key', 'Psionic Crystal'
      ];
      
      const artifactName = artifacts[Math.floor(Math.random() * artifacts.length)];
      const value = Math.floor((150 + Math.random() * 350) * totalMultiplier);
      
      rewards.push({
        type: 'artifact',
        name: artifactName,
        quantity: 1,
        value
      });
    } else {
      // Consolation credits
      const credits = Math.floor((25 + Math.random() * 50) * levelMultiplier);
      rewards.push({
        type: 'credits',
        name: 'Archaeological Survey Fee',
        quantity: 1,
        value: credits
      });
    }
    
    return rewards;
  }

  private generateFishingRewards(levelMultiplier: number): Reward[] {
    const rewards: Reward[] = [];
    
    // Fishing always gives something
    const fishTypes = [
      'Space Plankton', 'Quantum Fish', 'Void Eel', 'Stellar Salmon',
      'Nebula Crab', 'Cosmic Shrimp', 'Dark Matter Whale'
    ];
    
    const fishName = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const quantity = Math.floor((1 + Math.random() * 2) * levelMultiplier);
    const value = Math.floor((20 + Math.random() * 30) * levelMultiplier);
    
    rewards.push({
      type: 'material',
      name: fishName,
      quantity,
      value: value * quantity
    });
    
    // Small credit bonus
    const credits = Math.floor((15 + Math.random() * 25) * levelMultiplier);
    rewards.push({
      type: 'credits',
      name: 'Fishing License Fee',
      quantity: 1,
      value: credits
    });
    
    return rewards;
  }

  private generateCombatMaterials(difficultyMultiplier: number, levelMultiplier: number): Reward[] {
    const rewards: Reward[] = [];
    const totalMultiplier = difficultyMultiplier * levelMultiplier;
    
    const combatMaterials = ['Scrap Metal', 'Damaged Electronics', 'Weapon Parts', 'Armor Fragments'];
    const numMaterials = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numMaterials; i++) {
      const materialName = combatMaterials[Math.floor(Math.random() * combatMaterials.length)];
      const quantity = Math.floor((1 + Math.random() * 2) * totalMultiplier);
      
      rewards.push({
        type: 'material',
        name: materialName,
        quantity,
        value: quantity * 8
      });
    }
    
    return rewards;
  }

  private generateBasicReward(multiplier: number): Reward {
    return {
      type: 'credits',
      name: 'Basic Reward',
      quantity: 1,
      value: Math.floor((10 + Math.random() * 20) * multiplier)
    };
  }

  private generateSpecialQuestRewards(multiplier: number): Reward[] {
    const rewards: Reward[] = [];
    
    // Chance for rare components
    if (Math.random() < 0.4) {
      const components = ['Advanced Targeting System', 'Quantum Engine', 'Neural Interface'];
      const componentName = components[Math.floor(Math.random() * components.length)];
      
      rewards.push({
        type: 'component',
        name: componentName,
        quantity: 1,
        value: Math.floor(300 * multiplier)
      });
    }
    
    // Chance for nexium
    if (Math.random() < 0.3) {
      const nexiumAmount = Math.floor((2 + Math.random() * 4) * multiplier);
      rewards.push({
        type: 'nexium',
        name: 'Quest Nexium',
        quantity: nexiumAmount,
        value: nexiumAmount * 100
      });
    }
    
    return rewards;
  }

  calculateMarketPriceModifier(rarity: string, basePrice: number): number {
    const rarityMultipliers = {
      'common': 1.0,
      'uncommon': 1.5,
      'rare': 2.5,
      'epic': 4.0,
      'legendary': 6.5
    };
    
    const multiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 1.0;
    const marketFluctuation = 0.8 + Math.random() * 0.4; // ±20% market fluctuation
    
    return Math.floor(basePrice * multiplier * marketFluctuation);
  }

  calculateRepairCosts(shipHealth: number, maxHealth: number, shipTier: number): number {
    const damagePercent = 1 - (shipHealth / maxHealth);
    const baseCost = 50;
    const tierMultiplier = 1 + (shipTier - 1) * 0.5;
    
    return Math.floor(baseCost * damagePercent * tierMultiplier * maxHealth / 100);
  }

  calculateSalvageValue(itemValue: number, condition: number): number {
    // Condition is 0-1, where 1 is perfect condition
    const salvageRate = 0.2 + condition * 0.3; // 20-50% of original value
    return Math.floor(itemValue * salvageRate);
  }
}

export const rewardCalculator = new RewardCalculator();
