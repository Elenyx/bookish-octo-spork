import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { storage } from '../storage';
import { combatSystem } from '../services/combatSystem';
import EMOJIS from './emojis';

const combat = {
  data: new SlashCommandBuilder()
    .setName('combat')
    .setDescription('Engage in combat')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Combat type')
        .setRequired(true)
        .addChoices(
          { name: `🤖 PvE Battle`, value: 'pve' },
          { name: `${EMOJIS.battles} PvP Duel`, value: 'pvp' }
        ))
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('Opponent for PvP (required for PvP)')
        .setRequired(false)),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const combatType = interaction.options.getString('type');
      let result;

      if (combatType === 'pve') {
        result = await combatSystem.pveCompat(user.id, 'random');
      } else {
        const opponent = interaction.options.getUser('opponent');
        if (!opponent) {
          return interaction.reply({ content: 'PvP combat requires an opponent!', ephemeral: true });
        }
        
        const opponentUser = await storage.getUserByDiscordId(opponent.id);
        if (!opponentUser) {
          return interaction.reply({ content: 'Opponent is not registered!', ephemeral: true });
        }

        result = await combatSystem.pvpCombat(user.id, opponentUser.id);
      }

      const embed = new EmbedBuilder()
        .setColor(result.result?.winner === user.id ? 0x00FF00 : 0xFF0000)
  .setTitle(`${EMOJIS.battles} COMBAT ${result.result?.winner === user.id ? 'VICTORY' : 'DEFEAT'}`)
        .addFields(
          { name: '🔥 Damage Dealt', value: (result.result?.attackerDamage || 0).toString(), inline: true },
          { name: '💥 Damage Received', value: (result.result?.defenderDamage || 0).toString(), inline: true },
          { name: '⭐ Experience', value: (result.result?.experience || 0).toString(), inline: true }
        );

      if (result.result?.rewards && result.result.rewards.length > 0) {
        const rewardText = result.result.rewards.map(reward => 
          `${reward.name} x${reward.quantity}`
        ).join('\n');
  embed.addFields({ name: EMOJIS.rewards + ' Rewards', value: rewardText });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Combat error:', error);
      await interaction.reply({ content: 'Combat failed. Please try again.', ephemeral: true });
    }
  }
};

export default combat;