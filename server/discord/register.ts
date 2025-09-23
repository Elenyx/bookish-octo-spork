import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import EMOJIS from './emojis';
import { storage } from '../storage';
import { gameEngine } from '../services/gameEngine';

const register = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register to start your space exploration journey'),
  
  async execute(interaction: any) {
    try {
      const discordId = interaction.user.id;
      const username = interaction.user.username;

      const existingUser = await storage.getUserByDiscordId(discordId);
      if (existingUser) {
        return interaction.reply({ content: 'You are already registered, Commander!', ephemeral: true });
      }

      const user = await gameEngine.registerUser({
        discordId,
        username,
        level: 1,
        experience: 0,
        credits: 1000,
        nexium: 25,
        stats: { exploration: 0, combat: 0, artifacts: 0, trades: 0 }
      });

      const embed = new EmbedBuilder()
        .setColor(0x00D4FF)
        .setTitle(`${EMOJIS.rocket} Welcome to Stellar Nexus!`)
        .setDescription(`Commander **${username}**, your journey begins now!`)
        .addFields(
          { name: `${EMOJIS.credits} Credits`, value: '1,000', inline: true },
          { name: `${EMOJIS.nexium} Nexium`, value: '25', inline: true },
          { name: `${EMOJIS.ship} Starting Ship`, value: 'Swiftwing Scout', inline: true }
        )
        .setFooter({ text: 'Use /profile to view your stats' });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Registration error:', error);
      await interaction.reply({ content: 'Registration failed. Please try again.', ephemeral: true });
    }
  }
};

export default register;