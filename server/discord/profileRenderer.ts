import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import EMOJIS, { parseEmojiTag, emojiTagToURL } from './emojis';

export function buildProfileEmbedsAndComponents(user: any, ships: any[]) {
  const activeShip = ships?.find((s: any) => s.isActive);

  const embed = new EmbedBuilder()
    .setColor(0x00D4FF)
    .setAuthor({ name: `Commander ${user.username}`, iconURL: emojiTagToURL(EMOJIS.commander) })
    .addFields(
      { name: `${EMOJIS.level} Level`, value: String(user.level || 1), inline: true },
      { name: 'Experience', value: String(user.experience || 0), inline: true },
      { name: `${EMOJIS.credits} Credits`, value: (user.credits || 0).toLocaleString(), inline: true },
      { name: `${EMOJIS.nexium} Nexium`, value: String(user.nexium || 0), inline: true },
      { name: `${EMOJIS.ship} Active Ship`, value: activeShip ? `${activeShip.variant} (${activeShip.type})` : 'None', inline: true },
      { name: `${EMOJIS.sectors} Sectors Explored`, value: String(user.stats?.exploration || 0), inline: true },
      { name: `${EMOJIS.battles} Battles Won`, value: String(user.stats?.combat || 0), inline: true }
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

  return { embed, actionRow };
}

export default buildProfileEmbedsAndComponents;
