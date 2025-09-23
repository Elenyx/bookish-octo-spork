import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { storage } from '../storage';
import { explorationSystem } from '../services/explorationSystem';
import EMOJIS from './emojis';

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
  embed.addFields({ name: EMOJIS.rewards + ' Rewards', value: rewardText });
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

export default explore;