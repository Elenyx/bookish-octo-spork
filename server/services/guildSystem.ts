import { storage } from '../storage';

// Default guild factions as mentioned in the requirements
const DEFAULT_GUILDS = [
  {
    name: 'Stellar Dominion',
    type: 'military',
    description: 'Military empire focused on combat and expansion',
    leaderId: 'npc_dominion_leader'
  },
  {
    name: 'Cosmic Traders',
    type: 'trade',
    description: 'Merchant guild specializing in commerce and trade routes',
    leaderId: 'npc_trader_leader'
  },
  {
    name: 'Void Explorers',
    type: 'exploration',
    description: 'Exploration society dedicated to discovering new worlds',
    leaderId: 'npc_explorer_leader'
  },
  {
    name: 'Nexus Researchers',
    type: 'research',
    description: 'Scientific organization advancing technology and knowledge',
    leaderId: 'npc_researcher_leader'
  }
];

class GuildSystem {
  async initializeDefaultGuilds() {
    const existingGuilds = await storage.getAllGuilds();
    
    if (existingGuilds.length === 0) {
      for (const guild of DEFAULT_GUILDS) {
        await storage.createGuild({
          name: guild.name,
          type: guild.type,
          description: guild.description,
          level: 1,
          experience: 0,
          memberCount: 1, // NPC leader
          maxMembers: 100,
          leaderId: guild.leaderId
        });
      }
    }
  }

  async joinGuild(userId: string, guildId: string) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.guildId) {
      return {
        success: false,
        error: 'You are already in a guild. Leave your current guild first.'
      };
    }

    const guild = await storage.getGuild(guildId);
    if (!guild) {
      return {
        success: false,
        error: 'Guild not found'
      };
    }

    if (guild.memberCount >= guild.maxMembers) {
      return {
        success: false,
        error: 'Guild is full'
      };
    }

    // Add user to guild
    await storage.updateUser(userId, { guildId });
    
    // Update guild member count
    await storage.updateGuild(guildId, {
      memberCount: guild.memberCount + 1
    });

    return {
      success: true,
      guild,
      message: `Welcome to ${guild.name}!`
    };
  }

  async leaveGuild(userId: string) {
    const user = await storage.getUser(userId);
    if (!user || !user.guildId) {
      throw new Error('User not in a guild');
    }

    const guild = await storage.getGuild(user.guildId);
    if (guild) {
      await storage.updateGuild(guild.id, {
        memberCount: Math.max(1, guild.memberCount - 1) // Keep at least NPC leader
      });
    }

    await storage.updateUser(userId, { guildId: null });

    return {
      success: true,
      message: `You have left ${guild?.name}`
    };
  }

  async contribute(userId: string, resourceType: string, amount: number) {
    const user = await storage.getUser(userId);
    if (!user || !user.guildId) {
      throw new Error('User not in a guild');
    }

    const guild = await storage.getGuild(user.guildId);
    if (!guild) {
      throw new Error('Guild not found');
    }

    let contributionValue = 0;

    if (resourceType === 'credits') {
      if (user.credits < amount) {
        throw new Error('Insufficient credits');
      }
      await storage.updateUser(userId, {
        credits: user.credits - amount
      });
      contributionValue = amount;
    } else if (resourceType === 'nexium') {
      if (user.nexium < amount) {
        throw new Error('Insufficient nexium');
      }
      await storage.updateUser(userId, {
        nexium: user.nexium - amount
      });
      contributionValue = amount * 10; // Nexium is worth more
    }

    // Add experience to guild
    const expGained = Math.floor(contributionValue / 10);
    const newGuildExp = guild.experience + expGained;
    const newGuildLevel = Math.floor(newGuildExp / 1000) + 1;

    const leveledUp = newGuildLevel > guild.level;

    await storage.updateGuild(guild.id, {
      experience: newGuildExp,
      level: newGuildLevel
    });

    // Award personal experience to contributor
    if (user) {
      const personalExp = Math.floor(expGained * 0.5);
      const currentUserExp = user.experience + personalExp;
      await storage.updateUser(userId, {
        experience: currentUserExp
      });
    }

    return {
      success: true,
      guildExpGained: expGained,
      guildLeveledUp: leveledUp,
      newGuildLevel,
      personalExpGained: Math.floor(expGained * 0.5),
      rewards: leveledUp ? this.calculateGuildLevelRewards(newGuildLevel) : []
    };
  }

  private calculateGuildLevelRewards(level: number) {
    const rewards = [];
    
    // Every 5 levels, increase max members
    if (level % 5 === 0) {
      rewards.push({
        type: 'member_increase',
        value: 25,
        description: 'Guild member capacity increased by 25'
      });
    }

    // Level-based rewards
    if (level % 10 === 0) {
      rewards.push({
        type: 'credits',
        value: level * 1000,
        description: `${level * 1000} credits for all members`
      });
    }

    return rewards;
  }

  async getGuildRankings() {
    const guilds = await storage.getAllGuilds();
    return guilds
      .sort((a, b) => {
        // Sort by level first, then by experience
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        return b.experience - a.experience;
      })
      .map((guild, index) => ({
        ...guild,
        rank: index + 1
      }));
  }

  async getGuildMembers(guildId: string) {
    return await storage.getGuildMembers(guildId);
  }

  async getGuildVsGuildData() {
    const rankings = await this.getGuildRankings();
    
    return rankings.map(guild => ({
      id: guild.id,
      name: guild.name,
      type: guild.type,
      level: guild.level,
      memberCount: guild.memberCount,
      rank: guild.rank,
      power: this.calculateGuildPower(guild)
    }));
  }

  private calculateGuildPower(guild: any): number {
    return guild.level * 100 + guild.memberCount * 10 + guild.experience;
  }

  async scheduleGuildWar(guild1Id: string, guild2Id: string) {
    // This would implement guild vs guild warfare
    // For now, return a placeholder
    return {
      scheduled: true,
      battleTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      participants: [guild1Id, guild2Id]
    };
  }
}

export const guildSystem = new GuildSystem();

// Initialize default guilds on startup
guildSystem.initializeDefaultGuilds().catch(console.error);
