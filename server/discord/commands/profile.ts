import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { storage } from '../../storage';
import EMOJIS from '../emojis';

const profile = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your player profile'),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x00D4FF)
        .setAuthor({ name: user.username })
        .addFields(
          { name: 'Level', value: String(user.level || 1), inline: true },
          { name: 'Experience', value: String(user.experience || 0), inline: true },
          { name: 'Credits', value: `${EMOJIS.credits} ${user.credits || 0}`, inline: true }
        );

      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('view_fleet').setLabel('Fleet').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('view_resources').setLabel('Resources').setStyle(ButtonStyle.Secondary)
        );

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Profile error:', error);
      await interaction.reply({ content: 'Failed to load profile.', ephemeral: true });
    }
  }
};

export default profile;
