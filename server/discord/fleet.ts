import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { storage } from '../storage';
import EMOJIS from './emojis';

const fleet = {
  data: new SlashCommandBuilder()
    .setName('fleet')
    .setDescription('Manage your ship fleet'),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const ships = await storage.getUserShips(user.id);
      
      const embed = new EmbedBuilder()
        .setColor(0x8B5CF6)
        .setTitle(`${EMOJIS.rocket} Your Fleet`)
        .setDescription('Manage your ships and upgrades');

      ships.forEach(ship => {
  const status = ship.isActive ? '🟢 ACTIVE' : '⚪ INACTIVE';
        embed.addFields({
          name: `${ship.variant} (Tier ${ship.tier})`,
          value: `${status}\n**Type**: ${ship.type}\n**Health**: ${ship.health}/${ship.maxHealth}\n**Speed**: ${ship.speed} | **Cargo**: ${ship.cargo} | **Weapons**: ${ship.weapons}`,
          inline: true
        });
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_ship')
        .setPlaceholder('Select a ship to activate or upgrade');

      ships.forEach(ship => {
        selectMenu.addOptions({
          label: `${ship.variant} (${ship.type})`,
          description: `Tier ${ship.tier} - Health: ${ship.health}/${ship.maxHealth}`,
          value: ship.id
        });
      });

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Fleet error:', error);
      await interaction.reply({ content: 'Failed to load fleet.', ephemeral: true });
    }
  }
};

export default fleet;