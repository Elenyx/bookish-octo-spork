import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { storage } from '../../storage';
import { guildSystem } from '../../services/guildSystem';
import EMOJIS from '../emojis';

export async function handleGuildContribute(interaction: ButtonInteraction, userId: string) {
  await interaction.reply({ 
    content: `${EMOJIS.nexium} Use \/guild contribute to contribute resources to your guild!`, 
    ephemeral: true 
  });
}

export async function handleGuildLeave(interaction: ButtonInteraction, userId: string) {
  if (!userId) return;
  
  await storage.updateUser(userId, { guildId: null });
  await interaction.reply({ content: `${EMOJIS.commander} You have left your guild.`, ephemeral: true });
}

export async function handleGuildSelection(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
  const result = await guildSystem.joinGuild(userId, guildId);
  
  if (result.success) {
    await interaction.reply({ 
      content: `${EMOJIS.commander} You have joined **${result.guild?.name}**!`, 
      ephemeral: true 
    });
  } else {
    await interaction.reply({ 
      content: `❌ Failed to join guild: ${result.error}`, 
      ephemeral: true 
    });
  }
}
