import { SlashCommandBuilder } from 'discord.js';
import { storage } from '../../storage';
import buildProfile from '../profileRenderer';

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

      const ships = await storage.getUserShips(user.id);
      const { embed, actionRow } = buildProfile(user, ships);

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Profile error:', error);
      await interaction.reply({ content: 'Failed to load profile.', ephemeral: true });
    }
  }
};

export default profile;
