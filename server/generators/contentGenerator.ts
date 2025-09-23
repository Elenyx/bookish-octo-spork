import { nameGenerator } from './nameGenerator';
import { planetGenerator } from './planetGenerator';
import { creatureGenerator } from './creatureGenerator';
import { loreGenerator } from './loreGenerator';
import { recipeGenerator } from './recipeGenerator';

class ContentGenerator {
  generateSectorName(): string {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Nexus', 'Void', 'Nova', 'Stellar'];
    const suffixes = ['Prime', 'Core', 'Rim', 'Drift', 'Gate', 'Haven', 'Expanse', 'Cluster'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix}-${suffix}-${numbers}`;
  }

  generateSectorData(sectorName: string) {
    return {
      name: sectorName,
      difficulty: Math.floor(Math.random() * 5) + 1,
      resources: this.generateSectorResources(),
      planets: Math.floor(Math.random() * 5) + 1,
      hostiles: Math.random() > 0.7,
      phenomena: this.generateSpacePhenomena()
    };
  }

  private generateSectorResources() {
    const resources = [
      'Iron Ore', 'Titanium', 'Nexium Crystal', 'Quantum Matter', 'Dark Energy',
      'Plasma Core', 'Crystalline Matrix', 'Alien Artifact', 'Rare Metals', 'Energy Cells'
    ];
    
    const sectorResources = [];
    const numResources = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < numResources; i++) {
      const resource = resources[Math.floor(Math.random() * resources.length)];
      sectorResources.push({
        name: resource,
        abundance: Math.random(),
        extractionDifficulty: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return sectorResources;
  }

  private generateSpacePhenomena() {
    const phenomena = [
      'Solar Storm', 'Gravitational Anomaly', 'Nebula Cloud', 'Asteroid Field',
      'Quantum Rift', 'Black Hole Proximity', 'Wormhole', 'Ion Storm'
    ];
    
    if (Math.random() > 0.6) {
      return phenomena[Math.floor(Math.random() * phenomena.length)];
    }
    return null;
  }

  generateEnemy(type: string = 'random', playerLevel: number = 1) {
    const enemyTypes = [
      { name: 'Space Pirate', weapons: 2, difficulty: 1 },
      { name: 'Rogue Miner', weapons: 1, difficulty: 1 },
      { name: 'Alien Patrol', weapons: 3, difficulty: 2 },
      { name: 'Void Hunter', weapons: 4, difficulty: 3 },
      { name: 'Quantum Specter', weapons: 2, difficulty: 4 },
      { name: 'Dark Fleet Destroyer', weapons: 6, difficulty: 5 }
    ];

    let enemy;
    if (type === 'random') {
      const maxDifficulty = Math.min(5, Math.floor(playerLevel / 5) + 1);
      const availableEnemies = enemyTypes.filter(e => e.difficulty <= maxDifficulty);
      enemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    } else {
      enemy = enemyTypes.find(e => e.name.toLowerCase().includes(type.toLowerCase())) || enemyTypes[0];
    }

    const levelMultiplier = 1 + (playerLevel - 1) * 0.1;
    
    return {
      name: enemy.name,
      weapons: Math.floor(enemy.weapons * levelMultiplier),
      difficulty: enemy.difficulty,
      power: Math.floor((enemy.weapons * 50 + enemy.difficulty * 100) * levelMultiplier),
      health: Math.floor((enemy.difficulty * 80 + 100) * levelMultiplier)
    };
  }

  generateAvailableSectors(userLevel: number) {
    const sectors = [];
    const maxSectors = Math.min(10, userLevel + 2);
    
    for (let i = 0; i < maxSectors; i++) {
      sectors.push({
        name: this.generateSectorName(),
        difficulty: Math.floor(Math.random() * Math.min(5, userLevel)) + 1,
        discovered: Math.random() > 0.3
      });
    }
    
    return sectors;
  }

  generateDailyMarketDeals(userLevel: number) {
    const deals = [];
    const numDeals = Math.floor(Math.random() * 3) + 2;
    
    const items = [
      'Quantum Core', 'Plasma Cannon', 'Shield Generator', 'Hyperspace Fuel',
      'Titanium Alloy', 'Energy Cell', 'Nexium Crystal', 'AI Core'
    ];
    
    for (let i = 0; i < numDeals; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const basePrice = Math.floor(Math.random() * 1000) + 100;
      const discount = Math.floor(Math.random() * 30) + 10;
      
      deals.push({
        name: item,
        originalPrice: basePrice,
        salePrice: Math.floor(basePrice * (1 - discount / 100)),
        discount: discount,
        timeLeft: Math.floor(Math.random() * 23) + 1 // hours
      });
    }
    
    return deals;
  }

  generateRandomEvent(userLevel: number) {
    const events = [
      {
        name: 'Mysterious Signal',
        description: 'Your sensors detect an unknown transmission',
        type: 'exploration',
        rewards: ['credits', 'experience']
      },
      {
        name: 'Merchant in Distress',
        description: 'A trader requests assistance',
        type: 'choice',
        rewards: ['credits', 'reputation']
      },
      {
        name: 'Ancient Relic',
        description: 'Scans reveal an ancient artifact nearby',
        type: 'artifact',
        rewards: ['artifact', 'experience']
      }
    ];
    
    return events[Math.floor(Math.random() * events.length)];
  }

  // Delegate to specialized generators
  generateName(type: string) {
    return nameGenerator.generate(type);
  }

  generatePlanet() {
    return planetGenerator.generate();
  }

  generateCreature() {
    return creatureGenerator.generate();
  }

  generateLore() {
    return loreGenerator.generate();
  }

  generateRecipe(type: string) {
    return recipeGenerator.generate(type);
  }
}

export const contentGenerator = new ContentGenerator();
