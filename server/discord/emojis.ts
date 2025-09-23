export const EMOJIS: { [key: string]: string } = {
  // Replace the placeholder IDs below with your actual custom emoji identifiers.
  // Format for custom emojis in messages: '<:name:id>' for static, '<a:name:id>' for animated.
  commander: '<a:Commander:1420078907671056485>',
  rocket: '<a:Rocket:1420079008720228402>',
  credits: '<a:Credits:1420078929665982565>',
  nexium: '<a:NEX:1420078972724842567>',
  ship: '<a:Ship:1420079037405069444>',
  level: '<a:Level:1420078958698827847>',
  sectors: '<a:Sectors:1420079024826486954>',
  battles: '<a:Battle:1420078887312036003>',
  fleet: '<a:Fleet:1420078944304103567>',
  resources: '<a:Resources:1420078993809473586>',
  rewards: '<a:Rewards:1420094290134175764>'
};

export default EMOJIS;

/**
 * Parse an emoji tag like '<a:Name:123456789>' and return { id, name, animated }
 */
export function parseEmojiTag(tag: string) {
  const match = /^(<a?:)([A-Za-z0-9_]+):(\d+)>$/.exec(tag);
  if (!match) return null;
  const animated = match[1] === '<a:';
  const name = match[2];
  const id = match[3];
  return { id, name, animated };
}

/**
 * Central mapping for guild-specific emojis.
 * Key can be guild id or guild name. Fill these with the custom emoji tag or emoji id you want displayed for that guild.
 * Example:
 * export const GUILD_EMOJIS = {
 *   'Stellar Dominion': '<a:Stellar:123456789012345678>',
 *   '123456789012345678': '<:GuildEmoji:234567890123456789>'
 * }
 */
export const GUILD_EMOJIS: { [key: string]: string } = {
  // Per-faction (in-game guild) custom emojis — keys are faction names (exact match to your DB records)
  'Cosmic Traders': '<a:CosmicTraders:1420094161511649493>',
  'Stellar Dominion': '<a:StellarDominion:1420094120873169059>',
  'Void Explorers': '<a:VoidExplorers:1420094137050599546>',
  'Nexus Researchers': '<a:NexusResearchers:1420094490097615018>'
};

/**
 * Returns a display string and parsed emoji object for a guild record, checking `GUILD_EMOJIS` first,
 * then falling back to guildRecord.emoji, and finally a provided fallback.
 */
export function getGuildEmoji(guildRecord: any, fallback?: string) {
  // check mapping by id
  if (!guildRecord) return { display: fallback || '', parsed: null };
  if (guildRecord.id && GUILD_EMOJIS[guildRecord.id]) {
    const display = GUILD_EMOJIS[guildRecord.id];
    const parsed = parseEmojiTag(display);
    return { display, parsed };
  }
  // check mapping by name
  if (guildRecord.name && GUILD_EMOJIS[guildRecord.name]) {
    const display = GUILD_EMOJIS[guildRecord.name];
    const parsed = parseEmojiTag(display);
    return { display, parsed };
  }

  // check stored emoji on the record itself
  const raw = guildRecord.emoji;
  if (raw) {
    if (typeof raw === 'string' && raw.startsWith('<')) {
      const parsed = parseEmojiTag(raw);
      return { display: raw, parsed };
    }
    if (typeof raw === 'string' && /^\d+$/.test(raw)) {
      const id = raw;
      const parsed = { id, name: 'emoji', animated: false };
      return { display: `<:emoji:${id}>`, parsed };
    }
    if (typeof raw === 'object' && raw.id) {
      const parsed = { id: raw.id, name: raw.name || 'emoji', animated: !!raw.animated };
      const display = parsed.animated ? `<a:${parsed.name}:${parsed.id}>` : `<:${parsed.name}:${parsed.id}>`;
      return { display, parsed };
    }
    return { display: String(raw), parsed: null };
  }

  // finally fallback
  if (fallback) {
    const parsed = parseEmojiTag(fallback);
    return { display: fallback, parsed };
  }

  return { display: '', parsed: null };
}

