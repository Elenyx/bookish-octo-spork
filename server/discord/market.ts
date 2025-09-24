import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { economySystem } from '../services/economySystem';
import EMOJIS, { parseEmojiTag, emojiTagToURL } from './emojis';

const market = {
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('Access the galactic market'),
  
  async execute(interaction: any) {
    try {
      const marketItems = await economySystem.getMarketItems();
      
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setAuthor({ name: 'Galactic Market', iconURL: emojiTagToURL(EMOJIS.rocket) })
        .setDescription('Buy and sell resources across the galaxy');

      marketItems.slice(0, 10).forEach(item => {
          embed.addFields({
          name: item.name,
          value: `${EMOJIS.credits} ${item.price} credits\n${EMOJIS.sectors} ${item.type}`,
          inline: true
        });
      });

      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          (() => {
            const btn = new ButtonBuilder()
              .setCustomId('market_buy')
              .setLabel('Buy Items')
              .setStyle(ButtonStyle.Success);
            const p = parseEmojiTag(EMOJIS.credits);
            if (p) btn.setEmoji({ id: p.id, name: p.name, animated: p.animated });
            return btn;
          })(),
          (() => {
            const btn = new ButtonBuilder()
              .setCustomId('market_sell')
              .setLabel('Sell Resources')
              .setStyle(ButtonStyle.Primary);
            const p = parseEmojiTag(EMOJIS.battles);
            if (p) btn.setEmoji({ id: p.id, name: p.name, animated: p.animated });
            return btn;
          })()
        );

      await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
      console.error('Market error:', error);
      await interaction.reply({ content: 'Failed to load market.', ephemeral: true });
    }
  }
};

export default market;