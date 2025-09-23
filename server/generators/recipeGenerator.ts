interface Recipe {
  name: string;
  type: 'weapon' | 'component' | 'upgrade' | 'consumable' | 'material';
  materials: Array<{ name: string; quantity: number }>;
  result: { name: string; quantity: number; stats?: any };
  level: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingTime: number; // in minutes
  description: string;
  category: string;
}

class RecipeGenerator {
  private readonly materialTypes = {
    basic: ['Iron Ore', 'Silicon', 'Carbon Fiber', 'Aluminum', 'Copper Wire'],
    advanced: ['Titanium Alloy', 'Quantum Steel', 'Plasma Conduit', 'Neural Fiber', 'Energy Cell'],
    rare: ['Nexium Crystal', 'Dark Matter', 'Temporal Crystal', 'Void Essence', 'Quantum Matrix'],
    exotic: ['Living Metal', 'Consciousness Core', 'Reality Shard', 'Infinity Particle', 'Dimensional Anchor']
  };

  private readonly weaponComponents = [
    'Barrel', 'Trigger Assembly', 'Power Core', 'Targeting System', 'Ammunition Feed',
    'Cooling System', 'Stabilizer', 'Charge Capacitor', 'Beam Focuser', 'Projectile Chamber'
  ];

  private readonly weaponTypes = [
    'Laser Rifle', 'Plasma Cannon', 'Ion Blaster', 'Quantum Disruptor', 'Particle Beam',
    'Photon Torpedo', 'Energy Lance', 'Pulse Rifle', 'Gravity Gun', 'Molecular Disassembler'
  ];

  private readonly componentTypes = [
    'Shield Generator', 'Engine Booster', 'Sensor Array', 'Life Support Module',
    'Navigation Computer', 'Communication Array', 'Power Regulator', 'Hull Plating',
    'Magnetic Field Generator', 'Quantum Processor'
  ];

  private readonly upgradeTypes = [
    'Armor Plating', 'Speed Enhancement', 'Weapon Modification', 'Sensor Upgrade',
    'Engine Tuning', 'Shield Booster', 'Cargo Expansion', 'Stealth Module',
    'Tactical Computer', 'Emergency Systems'
  ];

  generate(type?: string, level?: number, rarity?: string): Recipe {
    const recipeType = type as Recipe['type'] || this.getRandomType();
    const recipeLevel = level || Math.floor(Math.random() * 5) + 1;
    const recipeRarity = rarity as Recipe['rarity'] || this.getRandomRarity();

    switch (recipeType) {
      case 'weapon':
        return this.generateWeaponRecipe(recipeLevel, recipeRarity);
      case 'component':
        return this.generateComponentRecipe(recipeLevel, recipeRarity);
      case 'upgrade':
        return this.generateUpgradeRecipe(recipeLevel, recipeRarity);
      case 'consumable':
        return this.generateConsumableRecipe(recipeLevel, recipeRarity);
      case 'material':
        return this.generateMaterialRecipe(recipeLevel, recipeRarity);
      default:
        return this.generateWeaponRecipe(recipeLevel, recipeRarity);
    }
  }

  private getRandomType(): Recipe['type'] {
    const types: Recipe['type'][] = ['weapon', 'component', 'upgrade', 'consumable', 'material'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomRarity(): Recipe['rarity'] {
    const rarities: Recipe['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const weights = [0.4, 0.3, 0.2, 0.08, 0.02];
    
    const random = Math.random();
    let total = 0;
    for (let i = 0; i < weights.length; i++) {
      total += weights[i];
      if (random <= total) {
        return rarities[i];
      }
    }
    return 'common';
  }

  private generateWeaponRecipe(level: number, rarity: Recipe['rarity']): Recipe {
    const weaponName = this.weaponTypes[Math.floor(Math.random() * this.weaponTypes.length)];
    const materials = this.generateMaterials(level, rarity, 'weapon');
    
    const damage = this.calculateWeaponDamage(level, rarity);
    const accuracy = Math.floor(Math.random() * 20) + 70; // 70-90% accuracy
    const critChance = Math.floor(Math.random() * 15) + 5; // 5-20% crit chance

    return {
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${weaponName}`,
      type: 'weapon',
      materials,
      result: {
        name: weaponName,
        quantity: 1,
        stats: {
          damage,
          accuracy,
          critChance,
          range: Math.floor(Math.random() * 500) + 200 // 200-700 range
        }
      },
      level,
      rarity,
      craftingTime: this.calculateCraftingTime(rarity, 'weapon'),
      description: `A ${rarity} grade ${weaponName.toLowerCase()} designed for space combat. Deals ${damage} damage with ${accuracy}% accuracy.`,
      category: 'Weapons'
    };
  }

  private generateComponentRecipe(level: number, rarity: Recipe['rarity']): Recipe {
    const componentName = this.componentTypes[Math.floor(Math.random() * this.componentTypes.length)];
    const materials = this.generateMaterials(level, rarity, 'component');
    
    const bonus = this.calculateComponentBonus(level, rarity);

    return {
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${componentName}`,
      type: 'component',
      materials,
      result: {
        name: componentName,
        quantity: 1,
        stats: {
          efficiency: bonus,
          durability: Math.floor(Math.random() * 1000) + 500,
          powerConsumption: Math.floor(Math.random() * 50) + 10
        }
      },
      level,
      rarity,
      craftingTime: this.calculateCraftingTime(rarity, 'component'),
      description: `A ${rarity} ${componentName.toLowerCase()} that provides ${bonus}% efficiency bonus to ship systems.`,
      category: 'Ship Components'
    };
  }

  private generateUpgradeRecipe(level: number, rarity: Recipe['rarity']): Recipe {
    const upgradeName = this.upgradeTypes[Math.floor(Math.random() * this.upgradeTypes.length)];
    const materials = this.generateMaterials(level, rarity, 'upgrade');
    
    const bonusValue = this.calculateUpgradeBonus(level, rarity);

    return {
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${upgradeName}`,
      type: 'upgrade',
      materials,
      result: {
        name: upgradeName,
        quantity: 1,
        stats: {
          bonusType: this.getUpgradeBonusType(upgradeName),
          bonusValue,
          installationCost: Math.floor(Math.random() * 1000) + 200
        }
      },
      level,
      rarity,
      craftingTime: this.calculateCraftingTime(rarity, 'upgrade'),
      description: `A ${rarity} upgrade module that enhances ship performance. Provides +${bonusValue} to relevant systems.`,
      category: 'Ship Upgrades'
    };
  }

  private generateConsumableRecipe(level: number, rarity: Recipe['rarity']): Recipe {
    const consumables = [
      'Repair Kit', 'Shield Battery', 'Energy Boost', 'Hull Sealant', 'System Stabilizer',
      'Emergency Oxygen', 'Nano-repair Swarm', 'Power Cell', 'Medical Kit', 'Fuel Injector'
    ];
    
    const consumableName = consumables[Math.floor(Math.random() * consumables.length)];
    const materials = this.generateMaterials(level, rarity, 'consumable');
    
    const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 items per craft
    const effectValue = this.calculateConsumableEffect(level, rarity);

    return {
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${consumableName}`,
      type: 'consumable',
      materials,
      result: {
        name: consumableName,
        quantity,
        stats: {
          effect: this.getConsumableEffect(consumableName),
          value: effectValue,
          uses: 1
        }
      },
      level,
      rarity,
      craftingTime: this.calculateCraftingTime(rarity, 'consumable'),
      description: `A ${rarity} ${consumableName.toLowerCase()} that provides ${effectValue} points of restoration when used.`,
      category: 'Consumables'
    };
  }

  private generateMaterialRecipe(level: number, rarity: Recipe['rarity']): Recipe {
    const materialName = `Processed ${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Alloy`;
    const rawMaterials = this.generateRawMaterials(level, rarity);
    
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 processed materials

    return {
      name: materialName,
      type: 'material',
      materials: rawMaterials,
      result: {
        name: materialName,
        quantity,
        stats: {
          purity: Math.floor(Math.random() * 20) + 80, // 80-100% purity
          marketValue: this.calculateMaterialValue(level, rarity)
        }
      },
      level,
      rarity,
      craftingTime: this.calculateCraftingTime(rarity, 'material'),
      description: `A refined ${rarity} alloy suitable for advanced crafting projects. Higher purity materials yield better results.`,
      category: 'Refined Materials'
    };
  }

  private generateMaterials(level: number, rarity: Recipe['rarity'], recipeType: string): Array<{ name: string; quantity: number }> {
    const materials: Array<{ name: string; quantity: number }> = [];
    
    // Base materials needed
    const numMaterials = Math.min(6, Math.floor(level / 2) + 2 + (rarity === 'legendary' ? 2 : 0));
    
    // Add basic materials
    const basicMaterial = this.materialTypes.basic[Math.floor(Math.random() * this.materialTypes.basic.length)];
    materials.push({ name: basicMaterial, quantity: Math.floor(Math.random() * 5) + 1 });
    
    // Add materials based on level and rarity
    if (level >= 2) {
      const advancedMaterial = this.materialTypes.advanced[Math.floor(Math.random() * this.materialTypes.advanced.length)];
      materials.push({ name: advancedMaterial, quantity: Math.floor(Math.random() * 3) + 1 });
    }
    
    if (level >= 3 || ['rare', 'epic', 'legendary'].includes(rarity)) {
      const rareMaterial = this.materialTypes.rare[Math.floor(Math.random() * this.materialTypes.rare.length)];
      materials.push({ name: rareMaterial, quantity: Math.floor(Math.random() * 2) + 1 });
    }
    
    if (rarity === 'legendary') {
      const exoticMaterial = this.materialTypes.exotic[Math.floor(Math.random() * this.materialTypes.exotic.length)];
      materials.push({ name: exoticMaterial, quantity: 1 });
    }
    
    // Add specific components for weapons
    if (recipeType === 'weapon') {
      const component = this.weaponComponents[Math.floor(Math.random() * this.weaponComponents.length)];
      materials.push({ name: component, quantity: 1 });
    }
    
    return materials;
  }

  private generateRawMaterials(level: number, rarity: Recipe['rarity']): Array<{ name: string; quantity: number }> {
    const materials: Array<{ name: string; quantity: number }> = [];
    
    // More raw materials needed for processing
    const quantity = Math.floor(Math.random() * 10) + 5; // 5-15 raw materials
    
    let materialPool = this.materialTypes.basic;
    if (rarity === 'uncommon' || rarity === 'rare') materialPool = this.materialTypes.advanced;
    if (rarity === 'epic' || rarity === 'legendary') materialPool = this.materialTypes.rare;
    
    const material = materialPool[Math.floor(Math.random() * materialPool.length)];
    materials.push({ name: `Raw ${material}`, quantity });
    
    return materials;
  }

  private calculateWeaponDamage(level: number, rarity: Recipe['rarity']): number {
    const baseRarityMultipliers = {
      'common': 1.0,
      'uncommon': 1.2,
      'rare': 1.5,
      'epic': 1.8,
      'legendary': 2.2
    };
    
    const baseDamage = 50;
    const levelMultiplier = 1 + (level - 1) * 0.2;
    const rarityMultiplier = baseRarityMultipliers[rarity];
    
    return Math.floor(baseDamage * levelMultiplier * rarityMultiplier);
  }

  private calculateComponentBonus(level: number, rarity: Recipe['rarity']): number {
    const baseRarityBonus = {
      'common': 5,
      'uncommon': 10,
      'rare': 20,
      'epic': 35,
      'legendary': 50
    };
    
    return baseRarityBonus[rarity] + (level - 1) * 5;
  }

  private calculateUpgradeBonus(level: number, rarity: Recipe['rarity']): number {
    const baseRarityBonus = {
      'common': 10,
      'uncommon': 20,
      'rare': 35,
      'epic': 55,
      'legendary': 80
    };
    
    return baseRarityBonus[rarity] + (level - 1) * 10;
  }

  private calculateConsumableEffect(level: number, rarity: Recipe['rarity']): number {
    const baseRarityEffect = {
      'common': 50,
      'uncommon': 100,
      'rare': 200,
      'epic': 350,
      'legendary': 500
    };
    
    return baseRarityEffect[rarity] + (level - 1) * 25;
  }

  private calculateMaterialValue(level: number, rarity: Recipe['rarity']): number {
    const baseRarityValue = {
      'common': 25,
      'uncommon': 75,
      'rare': 200,
      'epic': 500,
      'legendary': 1000
    };
    
    return baseRarityValue[rarity] + (level - 1) * 50;
  }

  private calculateCraftingTime(rarity: Recipe['rarity'], type: string): number {
    const baseTime = {
      'common': 5,
      'uncommon': 15,
      'rare': 30,
      'epic': 60,
      'legendary': 120
    };
    
    const typeMultiplier = {
      'weapon': 1.5,
      'component': 1.2,
      'upgrade': 1.0,
      'consumable': 0.5,
      'material': 0.8
    };
    
    return Math.floor(baseTime[rarity] * typeMultiplier[type as keyof typeof typeMultiplier]);
  }

  private getUpgradeBonusType(upgradeName: string): string {
    const bonusMapping: { [key: string]: string } = {
      'Armor Plating': 'health',
      'Speed Enhancement': 'speed',
      'Weapon Modification': 'damage',
      'Sensor Upgrade': 'sensors',
      'Engine Tuning': 'speed',
      'Shield Booster': 'shields',
      'Cargo Expansion': 'cargo',
      'Stealth Module': 'stealth',
      'Tactical Computer': 'accuracy',
      'Emergency Systems': 'survival'
    };
    
    return bonusMapping[upgradeName] || 'general';
  }

  private getConsumableEffect(consumableName: string): string {
    const effectMapping: { [key: string]: string } = {
      'Repair Kit': 'hull_repair',
      'Shield Battery': 'shield_restore',
      'Energy Boost': 'energy_restore',
      'Hull Sealant': 'emergency_repair',
      'System Stabilizer': 'system_repair',
      'Emergency Oxygen': 'life_support',
      'Nano-repair Swarm': 'auto_repair',
      'Power Cell': 'power_boost',
      'Medical Kit': 'crew_heal',
      'Fuel Injector': 'fuel_efficiency'
    };
    
    return effectMapping[consumableName] || 'general_boost';
  }

  generateRecipeBook(level: number = 1): Recipe[] {
    const recipes: Recipe[] = [];
    const types: Recipe['type'][] = ['weapon', 'component', 'upgrade', 'consumable', 'material'];
    
    types.forEach(type => {
      for (let i = 1; i <= Math.min(level, 5); i++) {
        const numRecipes = type === 'weapon' ? 3 : 2;
        for (let j = 0; j < numRecipes; j++) {
          recipes.push(this.generate(type, i));
        }
      }
    });
    
    return recipes.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });
  }
}

export const recipeGenerator = new RecipeGenerator();
