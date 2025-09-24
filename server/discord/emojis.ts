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
  contribute: '<a:Contribute:1420433027221164042>',
  type: `<a:Type:1420440048519614544>`,
  members: `<a:Member:1420433001938026547>`,
  leaveGuild:`<a:Leave:1420434200724639799>`,
  rewards: '<a:Rewards:1420094290134175764>',
  availableGuilds: `<a:Guild:1420439907838722068>`,
};

export default EMOJIS;

// Ship tier emojis (use ONLY for ship tier displays)
export const SHIP_TIER_EMOJIS: { [key: string]: string } = {
  'ScoutT1': '<a:ScoutT1:1420448091139473479>',
  'ScoutT2': '<a:ScoutT2:1420448106079715348>',
  'ScoutT3': '<a:ScoutT3:1420448118238875740>',
  'ScoutT4': '<a:ScoutT4:1420448131035824280>',

  'FighterT1': '<a:FighterT1:1420448182252343388>',
  'FighterT2': '<a:FighterT2:1420448194206367894>',
  'FighterT3': '<a:FighterT3:1420448205069357110>',
  'FighterT4': '<a:FighterT4:1420448216557682758>',

  'FreighterT1': '<a:FreighterT1:1420448246484172941>',
  'FreighterT2': '<a:FreighterT2:1420448258806779944>',
  'FreighterT3': '<a:FreighterT3:1420448273579114496>',
  'FreighterT4': '<a:FreighterT4:1420448287206670491>',

  'ExplorerT1': '<a:ExplorerT1:1420448317388881950>',
  'ExplorerT2': '<a:ExplorerT2:1420448332190318622>',
  'ExplorerT3': '<a:ExplorerT3:1420448345121362031>',
  'ExplorerT4': '<a:ExplorerT4:1420448356626333696>',

  'BattlecruiserT1': '<a:BattlecruiserT1:1420448387961979001>',
  'BattlecruiserT2': '<a:BattlecruiserT2:1420448400930770964>',
  'BattlecruiserT3': '<a:BattlecruiserT3:1420448413539110922>',
  'BattlecruiserT4': '<a:BattlecruiserT4:1420448424729252030>',

  'FlagshipT1': '<a:FlagshipT1:1420448447793987714>',
  'FlagshipT2': '<a:FlagshipT2:1420448459403694265>',
  'FlagshipT3': '<a:FlagshipT3:1420448471877419079>',
  'FlagshipT4': '<a:FlagshipT4:1420448481935360020>'
};

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
 * Convert a parsed emoji (or raw tag) to a CDN URL for embed icons.
 * Returns undefined if tag cannot be parsed.
 */
export function emojiTagToURL(tagOrParsed: string | { id: string; name?: string; animated?: boolean } | null | undefined) {
  if (!tagOrParsed) return undefined;
  let id: string | undefined;
  let animated = false;

  if (typeof tagOrParsed === 'string') {
    const parsed = parseEmojiTag(tagOrParsed);
    if (!parsed) return undefined;
    id = parsed.id;
    animated = parsed.animated;
  } else if (typeof tagOrParsed === 'object' && tagOrParsed.id) {
    id = tagOrParsed.id;
    animated = !!tagOrParsed.animated;
  }

  if (!id) return undefined;
  const ext = animated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/emojis/${id}.${ext}`;
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

