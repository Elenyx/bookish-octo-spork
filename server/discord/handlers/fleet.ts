import { ButtonInteraction, ContainerBuilder, MessageFlags, SectionBuilder, TextDisplayBuilder, SeparatorBuilder } from 'discord.js';
import { storage } from '../../storage';
import EMOJIS, { SHIP_TIER_EMOJIS, emojiTagToURL } from '../emojis';
import type { Ship } from '../../shared/schema';

export async function handleViewFleet(interaction: ButtonInteraction, userId: string) {
  const ships = await storage.getUserShips(userId);
  if (!ships || ships.length === 0) {
    await interaction.reply({ content: 'You have no ships in your fleet.', ephemeral: true });
    return;
  }

  const MAX_SECTIONS = 12;
  if (ships.length > MAX_SECTIONS) {
    let fleetText = `${EMOJIS.rocket} **Your Fleet:**\n\n`;
  (ships as Ship[]).forEach((ship) => {
      const status = ship.isActive ? '🟢' : '⚪';
      const typeKey = String(ship.type || '')
        .split(/\s+/)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join('');
      const tierKey = `${typeKey}T${ship.tier}`;
      const tierEmojiTag = SHIP_TIER_EMOJIS[tierKey];
      const tierDisplay = tierEmojiTag ? `${tierEmojiTag}` : `T${ship.tier}`;

      fleetText += `${status} **${ship.variant}** (${ship.type} ${tierDisplay})\n`;
      fleetText += `   HP: ${ship.health}/${ship.maxHealth} | Speed: ${ship.speed} | Cargo: ${ship.cargo}\n\n`;
    });

    await interaction.reply({ content: fleetText, ephemeral: true });
    return;
  }

  try {
    const container = new ContainerBuilder().setAccentColor(0x00D4FF)
      .addTextDisplayComponents(td => td.setContent(`${EMOJIS.rocket} **Your Fleet:**`));

  (ships as Ship[]).forEach((ship) => {
      const status = ship.isActive ? '🟢' : '⚪';
      const typeKey = String(ship.type || '')
        .split(/\s+/)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join('');
      const tierKey = `${typeKey}T${ship.tier}`;
      const tierEmojiTag = SHIP_TIER_EMOJIS[tierKey];
      const tierDisplay = tierEmojiTag ? `${tierEmojiTag}` : `T${ship.tier}`;

      container.addSectionComponents(section =>
        section
          .addTextDisplayComponents(
            td => td.setContent(`${status} **${ship.variant}** (${ship.type} ${tierDisplay})`),
            td => td.setContent(`HP: ${ship.health}/${ship.maxHealth} | Speed: ${ship.speed} | Cargo: ${ship.cargo}`)
          )
          .setThumbnailAccessory(th => {
            const url = tierEmojiTag ? emojiTagToURL(tierEmojiTag) : undefined;
            if (url) th.setURL(url).setDescription(`${ship.variant} icon`);
            return th;
          })
      );

      container.addSeparatorComponents(separator => separator.setDivider(false));
    });

    await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2, ephemeral: true });
    return;
  } catch (err) {
    console.warn('Components V2 render failed, falling back to embed text:', err);
    let fleetText = `${EMOJIS.rocket} **Your Fleet:**\n\n`;
  (ships as Ship[]).forEach((ship) => {
      const status = ship.isActive ? '🟢' : '⚪';
      const typeKey = String(ship.type || '')
        .split(/\s+/)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join('');
      const tierKey = `${typeKey}T${ship.tier}`;
      const tierEmojiTag = SHIP_TIER_EMOJIS[tierKey];
      const tierDisplay = tierEmojiTag ? `${tierEmojiTag}` : `T${ship.tier}`;

      fleetText += `${status} **${ship.variant}** (${ship.type} ${tierDisplay})\n`;
      fleetText += `   HP: ${ship.health}/${ship.maxHealth} | Speed: ${ship.speed} | Cargo: ${ship.cargo}\n\n`;
    });

    await interaction.reply({ content: fleetText, ephemeral: true });
    return;
  }
}
