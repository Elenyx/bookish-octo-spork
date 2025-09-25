import { ButtonInteraction } from 'discord.js';
import { storage } from '../../storage';
import EMOJIS from '../emojis';
import type { Resource } from '../../shared/schema';

export async function handleViewResources(interaction: ButtonInteraction, userId: string) {
  const resources = await storage.getUserResources(userId);
  
  let resourceText = `${EMOJIS.resources} **Your Resources:**\n\n`;
  (resources as Resource[]).forEach((resource) => {
    resourceText += `• **${resource.name}** x${resource.quantity} (${resource.rarity})\n`;
  });

  if (resources.length === 0) {
    resourceText += 'No resources found. Start exploring to gather materials!';
  }

  await interaction.reply({ content: resourceText, ephemeral: true });
}
