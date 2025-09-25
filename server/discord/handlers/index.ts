import { CommandInteraction, ButtonInteraction, StringSelectMenuInteraction, Collection } from 'discord.js';
import { storage } from '../../storage';
import { gameEngine } from '../../services/gameEngine';
import { economySystem } from '../../services/economySystem';
import { handleViewFleet } from './fleet';
import { handleViewResources } from './resources';
import { handleMarketBuy, handleMarketSell } from './market';
import { handleGuildContribute, handleGuildLeave, handleGuildSelection } from './guild';
import { handleShipSelection } from './selection';

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
