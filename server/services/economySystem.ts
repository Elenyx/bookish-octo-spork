import { storage } from '../storage';
import { contentGenerator } from '../generators/contentGenerator';

interface MarketItem {
  name: string;
  type: string;
  price: number;
  availability: number;
  rarity: string;
  description: string;
}

class EconomySystem {
  private marketItems: MarketItem[] = [];
  private lastMarketUpdate: number = 0;
  private readonly MARKET_UPDATE_INTERVAL = 3600000; // 1 hour

  constructor() {
    this.initializeMarket();
  }

  private initializeMarket() {
    this.marketItems = [
      {
        name: 'Quantum Core',
        type: 'component',
        price: 2500,
        availability: 10,
        rarity: 'rare',
        description: 'Advanced quantum processing unit'
      },
      {
        name: 'Nexium Crystal',
        type: 'material',
        price: 180,
        availability: 50,
        rarity: 'uncommon',
        description: 'Raw nexium crystal ore'
      },
      {
        name: 'Plasma Cannon',
        type: 'weapon',
        price: 5000,
        availability: 5,
        rarity: 'epic',
        description: 'High-energy plasma weapon system'
      },
      {
        name: 'Shield Generator',
        type: 'component',
        price: 3200,
        availability: 8,
        rarity: 'rare',
        description: 'Deflector shield technology'
      },
      {
        name: 'Hyperspace Fuel',
        type: 'material',
        price: 75,
        availability: 100,
        rarity: 'common',
        description: 'Standard hyperspace travel fuel'
      }
    ];
    this.lastMarketUpdate = Date.now();
  }

  async getMarketItems(): Promise<MarketItem[]> {
    // Update market prices periodically
    if (Date.now() - this.lastMarketUpdate > this.MARKET_UPDATE_INTERVAL) {
      this.updateMarketPrices();
    }
    return this.marketItems;
  }

  private updateMarketPrices() {
    this.marketItems.forEach(item => {
      // Fluctuate prices by ±15%
      const fluctuation = (Math.random() - 0.5) * 0.3;
      item.price = Math.floor(item.price * (1 + fluctuation));
      
      // Update availability
      item.availability = Math.max(0, item.availability + Math.floor(Math.random() * 10) - 5);
    });
    this.lastMarketUpdate = Date.now();
  }

  async buyItem(userId: string, itemName: string, quantity: number) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const item = this.marketItems.find(i => i.name === itemName);
    if (!item) {
      throw new Error('Item not found in market');
    }

    if (item.availability < quantity) {
      throw new Error('Insufficient item availability');
    }

    const totalCost = item.price * quantity;
    if (user.credits < totalCost) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await storage.updateUser(userId, {
      credits: user.credits - totalCost
    });

    // Add item to user inventory
    await storage.addResource({
      userId,
      name: item.name,
      type: item.type,
      quantity,
      rarity: item.rarity,
      value: item.price
    });

    // Update market availability
    item.availability -= quantity;

    // Log transaction
    await storage.addMarketTransaction({
      sellerId: null, // NPC transaction
      buyerId: userId,
      itemType: item.type,
      itemName: item.name,
      quantity,
      pricePerUnit: item.price,
      totalPrice: totalCost
    });

    return {
      success: true,
      item: item.name,
      quantity,
      totalCost,
      remainingCredits: user.credits - totalCost
    };
  }

  async sellResource(userId: string, resourceId: string, quantity: number, pricePerUnit: number) {
    const resource = await storage.getUserResources(userId);
    const targetResource = resource.find(r => r.id === resourceId);
    
    if (!targetResource) {
      throw new Error('Resource not found');
    }

    if (targetResource.quantity < quantity) {
      throw new Error('Insufficient resource quantity');
    }

    const totalIncome = pricePerUnit * quantity;

    // Update user credits
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await storage.updateUser(userId, {
      credits: user.credits + totalIncome
    });

    // Update or remove resource
    if (targetResource.quantity === quantity) {
      await storage.removeResource(resourceId);
    } else {
      await storage.updateResource(resourceId, {
        quantity: targetResource.quantity - quantity
      });
    }

    // Log transaction
    await storage.addMarketTransaction({
      sellerId: userId,
      buyerId: userId, // Player-to-market sale
      itemType: targetResource.type,
      itemName: targetResource.name,
      quantity,
      pricePerUnit,
      totalPrice: totalIncome
    });

    // Update user stats
    await storage.updateUser(userId, {
      stats: {
        ...user.stats,
        trades: user.stats.trades + 1
      }
    });

    return {
      success: true,
      resourceSold: targetResource.name,
      quantitySold: quantity,
      income: totalIncome,
      newCredits: user.credits + totalIncome
    };
  }

  async craftItem(userId: string, recipeId: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const recipes = await storage.getAllRecipes();
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const userResources = await storage.getUserResources(userId);

    // Check if user has all required materials
    const materialCheck = recipe.materials?.every(material => {
      const userMaterial = userResources.find(r => r.name === material.name);
      return userMaterial && userMaterial.quantity >= material.quantity;
    });

    if (!materialCheck) {
      throw new Error('Insufficient materials for crafting');
    }

    // Consume materials
    if (recipe.materials) {
      for (const material of recipe.materials) {
        const userMaterial = userResources.find(r => r.name === material.name);
        if (userMaterial) {
          if (userMaterial.quantity === material.quantity) {
            await storage.removeResource(userMaterial.id);
          } else {
            await storage.updateResource(userMaterial.id, {
              quantity: userMaterial.quantity - material.quantity
            });
          }
        }
      }
    }

    // Create result item
    if (recipe.result) {
      await storage.addResource({
        userId,
        name: recipe.result.name,
        type: recipe.type,
        quantity: recipe.result.quantity,
        rarity: recipe.rarity,
        value: this.calculateCraftedItemValue(recipe)
      });
    }

    return {
      success: true,
      crafted: recipe.result?.name,
      quantity: recipe.result?.quantity
    };
  }

  private calculateCraftedItemValue(recipe: any): number {
    const baseValue = {
      common: 50,
      uncommon: 150,
      rare: 400,
      epic: 800,
      legendary: 1500
    };
    return baseValue[recipe.rarity as keyof typeof baseValue] || 100;
  }

  async getMarketHistory(limit: number = 20) {
    return await storage.getMarketHistory(limit);
  }

  async generateDailyDeals(userLevel: number) {
    return contentGenerator.generateDailyMarketDeals(userLevel);
  }
}

export const economySystem = new EconomySystem();
