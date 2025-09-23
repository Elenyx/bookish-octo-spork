import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { storage } from '../storage';
import { gameEngine } from '../services/gameEngine';
import { explorationSystem } from '../services/explorationSystem';
import { combatSystem } from '../services/combatSystem';
import { economySystem } from '../services/economySystem';
import { guildSystem } from '../services/guildSystem';

// Register command
const register = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register to start your space exploration journey'),
  
  async execute(interaction: any) {
    try {
      const discordId = interaction.user.id;
      const username = interaction.user.username;

      const existingUser = await storage.getUserByDiscordId(discordId);
      if (existingUser) {
        return interaction.reply({ content: 'You are already registered, Commander!', ephemeral: true });
      }

      const user = await gameEngine.registerUser({
        discordId,
        username,
        level: 1,
        experience: 0,
        credits: 1000,
        nexium: 25,
        stats: { exploration: 0, combat: 0, artifacts: 0, trades: 0 }
      });

      const embed = new EmbedBuilder()
        .setColor(0x00D4FF)
        .setTitle('🚀 Welcome to Stellar Nexus!')
        .setDescription(`Commander **${username}**, your journey begins now!`)
        .addFields(
          { name: '💰 Credits', value: '1,000', inline: true },
          { name: '💎 Nexium', value: '25', inline: true },
          { name: '🚢 Starting Ship', value: 'Swiftwing Scout', inline: true }
        )
        .setFooter({ text: 'Use /profile to view your stats' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Registration error:', error);
      await interaction.reply({ content: 'Registration failed. Please try again.', ephemeral: true });
    }
  }
};

// Profile command
const profile = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your commander profile and stats'),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const ships = await storage.getUserShips(user.id);
      const activeShip = ships.find(ship => ship.isActive);

      const embed = new EmbedBuilder()
        .setColor(0x00D4FF)
        .setTitle(`🌟 Commander ${user.username}`)
        .addFields(
          { name: '📊 Level', value: (user.level || 1).toString(), inline: true },
          { name: '💰 Credits', value: (user.credits || 0).toLocaleString(), inline: true },
          { name: '💎 Nexium', value: (user.nexium || 0).toString(), inline: true },
          { name: '🚢 Active Ship', value: activeShip ? `${activeShip.variant} (${activeShip.type})` : 'None', inline: true },
          { name: '🗺️ Sectors Explored', value: (user.stats?.exploration || 0).toString(), inline: true },
          { name: '⚔️ Battles Won', value: (user.stats?.combat || 0).toString(), inline: true }
        );

      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('view_fleet')
            .setLabel('🚀 Fleet')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('view_resources')
            .setLabel('📦 Resources')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Profile error:', error);
      await interaction.reply({ content: 'Failed to load profile.', ephemeral: true });
    }
  }
};

// Fleet command
const fleet = {
  data: new SlashCommandBuilder()
    .setName('fleet')
    .setDescription('Manage your ship fleet'),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const ships = await storage.getUserShips(user.id);
      
      const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle('🚀 Your Fleet')
        .setDescription('Manage your ships and upgrades');

      ships.forEach(ship => {
        const status = ship.isActive ? '🟢 ACTIVE' : '⚪ INACTIVE';
        embed.addFields({
          name: `${ship.variant} (Tier ${ship.tier})`,
          value: `${status}\n**Type**: ${ship.type}\n**Health**: ${ship.health}/${ship.maxHealth}\n**Speed**: ${ship.speed} | **Cargo**: ${ship.cargo} | **Weapons**: ${ship.weapons}`,
          inline: true
        });
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_ship')
        .setPlaceholder('Select a ship to activate or upgrade');

      ships.forEach(ship => {
        selectMenu.addOptions({
          label: `${ship.variant} (${ship.type})`,
          description: `Tier ${ship.tier} - Health: ${ship.health}/${ship.maxHealth}`,
          value: ship.id
        });
      });

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Fleet error:', error);
      await interaction.reply({ content: 'Failed to load fleet.', ephemeral: true });
    }
  }
};

// Explore command
const explore = {
  data: new SlashCommandBuilder()
    .setName('explore')
    .setDescription('Explore space sectors for resources and discoveries')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of exploration')
        .setRequired(true)
        .addChoices(
          { name: '🔍 Sector Scan', value: 'exploration' },
          { name: '🎯 Resource Hunt', value: 'hunting' },
          { name: '🏺 Artifact Search', value: 'artifact_search' },
          { name: '🐟 Fishing', value: 'fishing' }
        )),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const explorationType = interaction.options.getString('type');
      const result = await explorationSystem.explore(user.id, explorationType, 'auto');

      const embed = new EmbedBuilder()
        .setColor(result.result?.success ? 0x00FF00 : 0xFFFF00)
        .setTitle(`🌌 ${explorationType.toUpperCase()} COMPLETE`)
        .setDescription(result.result?.success ? 'Exploration successful!' : 'Exploration yielded minimal results');

      if (result.result?.rewards && result.result.rewards.length > 0) {
        const rewardText = result.result.rewards.map(reward => 
          `${reward.name} x${reward.quantity} (${reward.value} credits)`
        ).join('\n');
        embed.addFields({ name: '🎁 Rewards', value: rewardText });
      }

      embed.addFields(
        { name: '⭐ Experience Gained', value: (result.result?.experience || 0).toString(), inline: true },
        { name: '📍 Sector', value: result.sector, inline: true }
      );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Explore error:', error);
      await interaction.reply({ content: 'Exploration failed. Please try again.', ephemeral: true });
    }
  }
};

// Combat command
const combat = {
  data: new SlashCommandBuilder()
    .setName('combat')
    .setDescription('Engage in combat')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Combat type')
        .setRequired(true)
        .addChoices(
          { name: '🤖 PvE Battle', value: 'pve' },
          { name: '⚔️ PvP Duel', value: 'pvp' }
        ))
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('Opponent for PvP (required for PvP)')
        .setRequired(false)),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const combatType = interaction.options.getString('type');
      let result;

      if (combatType === 'pve') {
        result = await combatSystem.pveCompat(user.id, 'random');
      } else {
        const opponent = interaction.options.getUser('opponent');
        if (!opponent) {
          return interaction.reply({ content: 'PvP combat requires an opponent!', ephemeral: true });
        }
        
        const opponentUser = await storage.getUserByDiscordId(opponent.id);
        if (!opponentUser) {
          return interaction.reply({ content: 'Opponent is not registered!', ephemeral: true });
        }

        result = await combatSystem.pvpCombat(user.id, opponentUser.id);
      }

      const embed = new EmbedBuilder()
        .setColor(result.result?.winner === user.id ? 0x00FF00 : 0xFF0000)
        .setTitle(`⚔️ COMBAT ${result.result?.winner === user.id ? 'VICTORY' : 'DEFEAT'}`)
        .addFields(
          { name: '🔥 Damage Dealt', value: (result.result?.attackerDamage || 0).toString(), inline: true },
          { name: '💥 Damage Received', value: (result.result?.defenderDamage || 0).toString(), inline: true },
          { name: '⭐ Experience', value: (result.result?.experience || 0).toString(), inline: true }
        );

      if (result.result?.rewards && result.result.rewards.length > 0) {
        const rewardText = result.result.rewards.map(reward => 
          `${reward.name} x${reward.quantity}`
        ).join('\n');
        embed.addFields({ name: '🎁 Rewards', value: rewardText });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Combat error:', error);
      await interaction.reply({ content: 'Combat failed. Please try again.', ephemeral: true });
    }
  }
};

// Market command
const market = {
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('Access the galactic market'),
  
  async execute(interaction: any) {
    try {
      const marketItems = await economySystem.getMarketItems();
      
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏪 Galactic Market')
        .setDescription('Buy and sell resources across the galaxy');

      marketItems.slice(0, 10).forEach(item => {
        embed.addFields({
          name: item.name,
          value: `💰 ${item.price} credits\n📊 ${item.type}`,
          inline: true
        });
      });

      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('market_buy')
            .setLabel('💳 Buy Items')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('market_sell')
            .setLabel('💸 Sell Resources')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Market error:', error);
      await interaction.reply({ content: 'Failed to load market.', ephemeral: true });
    }
  }
};

// Guild command
const guild = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Manage guild membership and activities'),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const guilds = await storage.getAllGuilds();
      
      if (user.guildId) {
        const userGuild = await storage.getGuild(user.guildId);
        const embed = new EmbedBuilder()
          .setColor(0x8B5CF6)
          .setTitle(`🛡️ ${userGuild?.name}`)
          .setDescription(`Guild Level: ${userGuild?.level}`)
          .addFields(
            { name: '👥 Members', value: `${userGuild?.memberCount}/${userGuild?.maxMembers}`, inline: true },
            { name: '📊 Type', value: userGuild?.type || 'Unknown', inline: true }
          );

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('guild_contribute')
              .setLabel('💎 Contribute')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('guild_leave')
              .setLabel('🚪 Leave Guild')
              .setStyle(ButtonStyle.Danger)
          );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0x8B5CF6)
          .setTitle('🛡️ Available Guilds')
          .setDescription('Choose a guild to join:');

        guilds.forEach(guild => {
          embed.addFields({
            name: guild.name,
            value: `**Type**: ${guild.type}\n**Level**: ${guild.level}\n**Members**: ${guild.memberCount}/${guild.maxMembers}`,
            inline: true
          });
        });

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('select_guild')
          .setPlaceholder('Select a guild to join');

        guilds.forEach(guild => {
          selectMenu.addOptions({
            label: guild.name,
            description: `${guild.type} - Level ${guild.level}`,
            value: guild.id
          });
        });

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
      }
    } catch (error) {
      console.error('Guild error:', error);
      await interaction.reply({ content: 'Failed to load guild information.', ephemeral: true });
    }
  }
};

export const commands = [
  register,
  profile,
  fleet,
  explore,
  combat,
  market,
  guild
];
