import { StringSelectMenuInteraction } from 'discord.js';
import { storage } from '../../storage';
import EMOJIS from '../emojis';
import type { Ship } from '../../../shared/schema';

export async function handleShipSelection(interaction: StringSelectMenuInteraction, userId: string, shipId: string) {
  await storage.setActiveShip(userId, shipId);
  
  const ship = await storage.getShip(shipId) as Ship | undefined;
  await interaction.reply({ 
    content: `${EMOJIS.rocket} **${ship?.variant}** is now your active ship!`, 
    ephemeral: true 
  });
}
