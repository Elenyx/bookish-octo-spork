import { nameGenerator } from './nameGenerator';

interface Creature {
  name: string;
  type: string;
  size: string;
  habitat: string;
  danger_level: number;
  abilities: string[];
  description: string;
  rarity: string;
  health: number;
  damage: number;
  defense: number;
  loot: Array<{
    name: string;
    type: string;
    rarity: string;
    value: number;
    dropChance: number;
  }>;
}

class CreatureGenerator {
  private readonly creatureTypes = [
    'Crystalline', 'Mechanical', 'Energy-based', 'Organic', 'Hybrid',
    'Gaseous', 'Plasma', 'Quantum', 'Ethereal', 'Silicon-based'
  ];

  private readonly sizes = [
    'Microscopic', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Colossal', 'Planetary'
  ];

  private readonly habitats = [
    'Space Void', 'Asteroid Fields', 'Nebulae', 'Planet Surface', 'Underground Caves',
    'Ocean Depths', 'Volcanic Regions', 'Ice Fields', 'Gas Giant Atmospheres',
    'Orbital Stations', 'Derelict Ships', 'Energy Storms'
  ];

  private readonly abilities = [
    'Phase Shifting', 'Energy Absorption', 'Electromagnetic Pulse', 'Camouflage',
    'Regeneration', 'Toxic Secretion', 'Gravity Manipulation', 'Time Dilation',
    'Matter Conversion', 'Telepathy', 'Quantum Tunneling', 'Ion Discharge',
    'Shield Generation', 'Molecular Disruption', 'Dimensional Rift', 'Mind Control'
  ];

  private readonly prefixes = [
    'Void', 'Quantum', 'Plasma', 'Crystal', 'Shadow', 'Nova', 'Stellar', 'Cosmic',
    'Nebula', 'Ion', 'Hyper', 'Meta', 'Proto', 'Ultra', 'Mega', 'Nano'
  ];

  private readonly basenames = [
    'Wyrm', 'Leviathan', 'Specter', 'Guardian', 'Hunter', 'Drifter', 'Stalker',
    'Sentinel', 'Wraith', 'Beast', 'Entity', 'Organism', 'Anomaly', 'Horror'
  ];

  generate(biome?: string, difficulty?: number): Creature {
    const type = this.creatureTypes[Math.floor(Math.random() * this.creatureTypes.length)];
    const size = this.sizes[Math.floor(Math.random() * this.sizes.length)];
    const habitat = biome || this.habitats[Math.floor(Math.random() * this.habitats.length)];
    
    const dangerLevel = difficulty || Math.floor(Math.random() * 5) + 1;
    const rarity = this.determineRarity(dangerLevel);
    
    const name = this.generateCreatureName();
    const abilities = this.generateAbilities(dangerLevel);
    const description = this.generateDescription(name, type, size, habitat, abilities);
    
    const stats = this.generateStats(size, dangerLevel);
    const loot = this.generateLoot(rarity, dangerLevel);

    return {
      name,
      type,
      size,
      habitat,
      danger_level: dangerLevel,
      abilities,
      description,
      rarity,
      health: stats.health,
      damage: stats.damage,
      defense: stats.defense,
      loot
    };
  }

  private generateCreatureName(): string {
    const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
    const basename = this.basenames[Math.floor(Math.random() * this.basenames.length)];
    
    if (Math.random() > 0.5) {
      return `${prefix} ${basename}`;
    } else {
      const alienName = nameGenerator.generate('alien');
      return `${basename} of ${alienName}`;
    }
  }

  private generateAbilities(dangerLevel: number): string[] {
    const numAbilities = Math.min(4, Math.floor(dangerLevel / 2) + 1);
    const selectedAbilities: string[] = [];
    
    for (let i = 0; i < numAbilities; i++) {
      let ability;
      do {
        ability = this.abilities[Math.floor(Math.random() * this.abilities.length)];
      } while (selectedAbilities.includes(ability));
      
      selectedAbilities.push(ability);
    }
    
    return selectedAbilities;
  }

  private generateDescription(name: string, type: string, size: string, habitat: string, abilities: string[]): string {
    const descriptions = [
      `The ${name} is a ${size.toLowerCase()} ${type.toLowerCase()} creature found in ${habitat.toLowerCase()}.`,
      `This ${type.toLowerCase()} entity roams the ${habitat.toLowerCase()}, using its ${abilities[0]?.toLowerCase()} ability to survive.`,
      `A mysterious ${size.toLowerCase()} being that haunts ${habitat.toLowerCase()}, known for its deadly ${abilities[0]?.toLowerCase()} attacks.`
    ];
    
    let baseDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    if (abilities.length > 1) {
      baseDesc += ` It possesses multiple abilities including ${abilities.slice(1).join(', ').toLowerCase()}.`;
    }
    
    return baseDesc;
  }

  private generateStats(size: string, dangerLevel: number) {
    const sizeMultipliers = {
      'Microscopic': 0.1,
      'Tiny': 0.3,
      'Small': 0.7,
      'Medium': 1.0,
      'Large': 1.5,
      'Huge': 2.5,
      'Colossal': 4.0,
      'Planetary': 10.0
    };
    
    const baseHealth = 100;
    const baseDamage = 25;
    const baseDefense = 10;
    
    const sizeMultiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;
    const levelMultiplier = 1 + (dangerLevel - 1) * 0.3;
    
    return {
      health: Math.floor(baseHealth * sizeMultiplier * levelMultiplier),
      damage: Math.floor(baseDamage * sizeMultiplier * levelMultiplier),
      defense: Math.floor(baseDefense * sizeMultiplier * levelMultiplier)
    };
  }

  private generateLoot(rarity: string, dangerLevel: number) {
    const lootTable = [
      { name: 'Organic Matter', type: 'material', rarity: 'common', value: 10, dropChance: 0.8 },
      { name: 'Energy Residue', type: 'material', rarity: 'common', value: 15, dropChance: 0.6 },
      { name: 'Creature Essence', type: 'component', rarity: 'uncommon', value: 50, dropChance: 0.4 },
      { name: 'Alien Genetic Sample', type: 'artifact', rarity: 'rare', value: 200, dropChance: 0.2 },
      { name: 'Quantum Biomatter', type: 'artifact', rarity: 'epic', value: 500, dropChance: 0.1 },
      { name: 'Living Crystal', type: 'artifact', rarity: 'legendary', value: 1000, dropChance: 0.05 }
    ];
    
    const possibleLoot = lootTable.filter(item => {
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      const itemRarityIndex = rarityOrder.indexOf(item.rarity);
      const creatureRarityIndex = rarityOrder.indexOf(rarity);
      
      return itemRarityIndex <= creatureRarityIndex + 1;
    });
    
    return possibleLoot.map(item => ({
      ...item,
      value: Math.floor(item.value * (1 + dangerLevel * 0.2))
    }));
  }

  private determineRarity(dangerLevel: number): string {
    if (dangerLevel <= 1) return 'common';
    if (dangerLevel <= 2) return 'uncommon';
    if (dangerLevel <= 3) return 'rare';
    if (dangerLevel <= 4) return 'epic';
    return 'legendary';
  }

  generateSwarm(baseCreature?: Creature): Creature[] {
    const swarmSize = Math.floor(Math.random() * 8) + 3; // 3-10 creatures
    const swarm: Creature[] = [];
    
    for (let i = 0; i < swarmSize; i++) {
      const creature = baseCreature ? { ...baseCreature } : this.generate();
      creature.name = `${creature.name} Swarm Member ${i + 1}`;
      creature.health = Math.floor(creature.health * 0.6); // Weaker individually
      creature.damage = Math.floor(creature.damage * 0.8);
      swarm.push(creature);
    }
    
    return swarm;
  }

  generateBoss(region: string, playerLevel: number): Creature {
    const baseDangerLevel = Math.min(5, Math.floor(playerLevel / 10) + 3);
    const boss = this.generate(region, baseDangerLevel);
    
    // Enhance boss stats
    boss.name = `${boss.name} Prime`;
    boss.health *= 3;
    boss.damage *= 2;
    boss.defense *= 1.5;
    boss.rarity = 'legendary';
    
    // Add boss-specific abilities
    boss.abilities.push('Area of Effect Attacks', 'Enrage Mode', 'Summon Minions');
    
    // Enhanced loot
    boss.loot = boss.loot.map(item => ({
      ...item,
      value: item.value * 3,
      dropChance: Math.min(1.0, item.dropChance * 1.5)
    }));
    
    return boss;
  }
}

export const creatureGenerator = new CreatureGenerator();
