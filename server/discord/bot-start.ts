// Provide a safe development fallback for missing DATABASE_URL so the bot can start
// sufficiently far to surface missing DISCORD_TOKEN or other runtime issues without
// crashing early. This should NOT be used in production.
if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'development') {
	console.warn('Warning: DATABASE_URL not set — using development placeholder to allow bot startup (no DB queries will work).');
	process.env.DATABASE_URL = 'postgresql://dev:dev@localhost:5432/devdb';
}

import { discordBot } from './bot';

discordBot.start().catch(console.error);