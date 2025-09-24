import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { storage } from '../storage';
import EMOJIS, { parseEmojiTag, emojiTagToURL } from './emojis';

const profile = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your commander profile and stats'),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const ships = await storage.getUserShips(user.id);
      const activeShip = ships.find(ship => ship.isActive);

      const embed = new EmbedBuilder()
        .setColor(0x00D4FF)
        .setAuthor({ name: `Commander ${user.username}`, iconURL: emojiTagToURL(EMOJIS.commander) })
        .addFields(
          { name: `${EMOJIS.level} Level`, value: (user.level || 1).toString(), inline: true },
          { name: `${EMOJIS.credits} Credits`, value: (user.credits || 0).toLocaleString(), inline: true },
          { name: `${EMOJIS.nexium} Nexium`, value: (user.nexium || 0).toString(), inline: true },
          { name: `${EMOJIS.ship} Active Ship`, value: activeShip ? `${activeShip.variant} (${activeShip.type})` : 'None', inline: true },
          { name: `${EMOJIS.sectors} Sectors Explored`, value: (user.stats?.exploration || 0).toString(), inline: true },
          { name: `${EMOJIS.battles} Battles Won`, value: (user.stats?.combat || 0).toString(), inline: true }
        );

      const fleetBtn = new ButtonBuilder()
        .setCustomId('view_fleet')
        .setLabel('Fleet')
        .setStyle(ButtonStyle.Primary);
      const fleetEmoji = parseEmojiTag(EMOJIS.fleet);
      if (fleetEmoji) fleetBtn.setEmoji({ id: fleetEmoji.id, name: fleetEmoji.name, animated: fleetEmoji.animated });

      const resourcesBtn = new ButtonBuilder()
        .setCustomId('view_resources')
        .setLabel('Resources')
        .setStyle(ButtonStyle.Secondary);
      const resEmoji = parseEmojiTag(EMOJIS.resources);
      if (resEmoji) resourcesBtn.setEmoji({ id: resEmoji.id, name: resEmoji.name, animated: resEmoji.animated });

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(fleetBtn, resourcesBtn);

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Profile error:', error);
      await interaction.reply({ content: 'Failed to load profile.', ephemeral: true });
    }
  }
};

export default profile;