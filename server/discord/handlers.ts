import { CommandInteraction, ButtonInteraction, StringSelectMenuInteraction, Collection } from 'discord.js';
import { storage } from '../storage';
import { gameEngine } from '../services/gameEngine';
import { guildSystem } from '../services/guildSystem';
import { economySystem } from '../services/economySystem';

export async function handleInteraction(interaction: any, commands: Collection<string, any>) {
  if (interaction.isChatInputCommand()) {
    await handleSlashCommand(interaction, commands);
  } else if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  } else if (interaction.isStringSelectMenu()) {
    await handleSelectMenuInteraction(interaction);
  }
}

async function handleSlashCommand(interaction: CommandInteraction, commands: Collection<string, any>) {
  const command = commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Error executing command:', error);
    
    const errorResponse = { 
      content: 'There was an error while executing this command!', 
      ephemeral: true 
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorResponse);
    } else {
      await interaction.reply(errorResponse);
    }
  }
}

async function handleButtonInteraction(interaction: ButtonInteraction) {
  const { customId } = interaction;

  try {
    const user = await storage.getUserByDiscordId(interaction.user.id);
    if (!user) {
      return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
    }

    switch (customId) {
      case 'view_fleet':
        await handleViewFleet(interaction, user.id);
        break;
      
      case 'view_resources':
        await handleViewResources(interaction, user.id);
        break;
      
      case 'market_buy':
        await handleMarketBuy(interaction, user.id);
        break;
      
      case 'market_sell':
        await handleMarketSell(interaction, user.id);
        break;
      
      case 'guild_contribute':
        await handleGuildContribute(interaction, user.id);
        break;
      
      case 'guild_leave':
        await handleGuildLeave(interaction, user.id);
        break;
      
      default:
        await interaction.reply({ content: 'Unknown action!', ephemeral: true });
    }
  } catch (error) {
    console.error('Button interaction error:', error);
    await interaction.reply({ content: 'Action failed. Please try again.', ephemeral: true });
  }
}

async function handleSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
  const { customId, values } = interaction;

  try {
    const user = await storage.getUserByDiscordId(interaction.user.id);
    if (!user) {
      return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
    }

    switch (customId) {
      case 'select_ship':
        await handleShipSelection(interaction, user.id, values[0]);
        break;
      
      case 'select_guild':
        await handleGuildSelection(interaction, user.id, values[0]);
        break;
      
      default:
        await interaction.reply({ content: 'Unknown selection!', ephemeral: true });
    }
  } catch (error) {
    console.error('Select menu interaction error:', error);
    await interaction.reply({ content: 'Selection failed. Please try again.', ephemeral: true });
  }
}

async function handleViewFleet(interaction: ButtonInteraction, userId: string) {
  const ships = await storage.getUserShips(userId);
  
  let fleetText = '🚀 **Your Fleet:**\n\n';
  ships.forEach(ship => {
    const status = ship.isActive ? '🟢' : '⚪';
    fleetText += `${status} **${ship.variant}** (${ship.type} T${ship.tier})\n`;
    fleetText += `   HP: ${ship.health}/${ship.maxHealth} | Speed: ${ship.speed} | Cargo: ${ship.cargo}\n\n`;
  });

  await interaction.reply({ content: fleetText, ephemeral: true });
}

async function handleViewResources(interaction: ButtonInteraction, userId: string) {
  const resources = await storage.getUserResources(userId);
  
  let resourceText = '📦 **Your Resources:**\n\n';
  resources.forEach(resource => {
    resourceText += `• **${resource.name}** x${resource.quantity} (${resource.rarity})\n`;
  });

  if (resources.length === 0) {
    resourceText += 'No resources found. Start exploring to gather materials!';
  }

  await interaction.reply({ content: resourceText, ephemeral: true });
}

async function handleMarketBuy(interaction: ButtonInteraction, userId: string) {
  await interaction.reply({ 
    content: '🏪 Market purchasing is available through the web dashboard or use specific buy commands!', 
    ephemeral: true 
  });
}

async function handleMarketSell(interaction: ButtonInteraction, userId: string) {
  await interaction.reply({ 
    content: '💸 Market selling is available through the web dashboard or use specific sell commands!', 
    ephemeral: true 
  });
}

async function handleGuildContribute(interaction: ButtonInteraction, userId: string) {
  await interaction.reply({ 
    content: '💎 Use `/guild contribute` to contribute resources to your guild!', 
    ephemeral: true 
  });
}

async function handleGuildLeave(interaction: ButtonInteraction, userId: string) {
  if (!userId) return;
  
  await storage.updateUser(userId, { guildId: null });
  await interaction.reply({ content: '🚪 You have left your guild.', ephemeral: true });
}

async function handleShipSelection(interaction: StringSelectMenuInteraction, userId: string, shipId: string) {
  await storage.setActiveShip(userId, shipId);
  
  const ship = await storage.getShip(shipId);
  await interaction.reply({ 
    content: `🚀 **${ship?.variant}** is now your active ship!`, 
    ephemeral: true 
  });
}

async function handleGuildSelection(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
  const result = await guildSystem.joinGuild(userId, guildId);
  
  if (result.success) {
    await interaction.reply({ 
      content: `🛡️ You have joined **${result.guild?.name}**!`, 
      ephemeral: true 
    });
  } else {
    await interaction.reply({ 
      content: `❌ Failed to join guild: ${result.error}`, 
      ephemeral: true 
    });
  }
}
