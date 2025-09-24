import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { storage } from '../storage';
import EMOJIS, { SHIP_TIER_EMOJIS, parseEmojiTag, emojiTagToURL } from './emojis';

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
        .setAuthor({ name: 'Your Fleet', iconURL: emojiTagToURL(EMOJIS.rocket) })
        .setDescription('Manage your ships and upgrades');

      ships.forEach(ship => {
        const status = ship.isActive ? '🟢 ACTIVE' : '⚪ INACTIVE';
        // determine tier emoji key (e.g. 'ScoutT1', 'FighterT3')
        const typeKey = String(ship.type || '')
          .split(/\s+/)
          .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
          .join('');
        const tierKey = `${typeKey}T${ship.tier}`;
        const tierEmojiTag = SHIP_TIER_EMOJIS[tierKey];
        const tierEmojiParsed = tierEmojiTag ? parseEmojiTag(tierEmojiTag) : null;
        const title = tierEmojiParsed ? `${tierEmojiTag} ${ship.variant}` : `${ship.variant} (Tier ${ship.tier})`;

        embed.addFields({
          name: title,
          value: `${status}\n**Type**: ${ship.type}\n**Health**: ${ship.health}/${ship.maxHealth}\n**Speed**: ${ship.speed} | **Cargo**: ${ship.cargo} | **Weapons**: ${ship.weapons}`,
          inline: true
        });
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_ship')
        .setPlaceholder('Select a ship to activate or upgrade');

      ships.forEach(ship => {
        // add emoji to option if available
        const typeKey = String(ship.type || '')
          .split(/\s+/)
          .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
          .join('');
        const tierKey = `${typeKey}T${ship.tier}`;
        const tierEmojiTag = SHIP_TIER_EMOJIS[tierKey];
        const option: any = {
          label: `${ship.variant} (${ship.type})`,
          description: `Tier ${ship.tier} - Health: ${ship.health}/${ship.maxHealth}`,
          value: ship.id
        };
        if (tierEmojiTag) {
          const parsed = parseEmojiTag(tierEmojiTag);
          if (parsed) option.emoji = { id: parsed.id, name: parsed.name, animated: parsed.animated };
        }
        selectMenu.addOptions(option);
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