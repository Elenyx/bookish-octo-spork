import 'dotenv/config';
import { db, pool } from '../server/db';
import { guilds } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  // Map of faction name -> emoji tag (the values you provided)
  const mapping: Record<string, string> = {
    'Cosmic Traders': '<a:CosmicTraders:1420094161511649493>',
    'Stellar Dominion': '<a:StellarDominion:1420094120873169059>',
    'Void Explorers': '<a:VoidExplorers:1420094137050599546>',
    'Nexus Researchers': '<a:NexusResearchers:1420094490097615018>'
  };

  // Ensure the emoji column exists (add if missing)
  try {
    await pool.query(`ALTER TABLE guilds ADD COLUMN IF NOT EXISTS emoji text;`);
    console.log('Ensured guilds.emoji column exists');
  } catch (err) {
    console.error('Failed to ensure emoji column:', err);
    throw err;
  }

  for (const [name, emoji] of Object.entries(mapping)) {
    console.log(`Updating guild '${name}' -> ${emoji}`);
    await db.update(guilds).set({ emoji }).where(eq(guilds.name, name));
  }

  console.log('Done updating guild emojis.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
