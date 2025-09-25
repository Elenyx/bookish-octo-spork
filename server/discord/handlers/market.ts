import { ButtonInteraction } from 'discord.js';
import EMOJIS from '../emojis';

export async function handleMarketBuy(interaction: ButtonInteraction, userId: string) {
  await interaction.reply({ 
    content: `${EMOJIS.credits} Market purchasing is available through the web dashboard or use specific buy commands!`, 
    ephemeral: true 
  });
}

export async function handleMarketSell(interaction: ButtonInteraction, userId: string) {
  await interaction.reply({ 
    content: `${EMOJIS.credits} Market selling is available through the web dashboard or use specific sell commands!`, 
    ephemeral: true 
  });
}
