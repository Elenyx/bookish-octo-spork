import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { storage } from '../../storage';

const register = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register your Discord account with Stellar Nexus'),
  
  async execute(interaction: any) {
    try {
      const discordId = interaction.user.id;
      const existingUser = await storage.getUserByDiscordId(discordId);
      if (existingUser) return interaction.reply({ content: 'You are already registered.', ephemeral: true });

      const user = await storage.createUser({ discordId, username: interaction.user.username, level: 1 });
      await interaction.reply({ content: `Registered! Welcome ${interaction.user.username}.`, ephemeral: true });
    } catch (error) {
      console.error('Register error:', error);
      await interaction.reply({ content: 'Registration failed.', ephemeral: true });
    }
  }
};

export default register;
