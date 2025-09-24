import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import EMOJIS, { SHIP_TIER_EMOJIS, parseEmojiTag } from './emojis';
import { commands } from './commands';
import { handleInteraction } from './handlers';

class DiscordBot {
  public client: Client;
  public commands: Collection<string, any>;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    
    this.commands = new Collection();
    this.setupCommands();
    this.setupEventHandlers();
  }

  private async logEmojiDiagnostics() {
    try {
      const available: string[] = [];
      const missing: string[] = [];

      // helper: check availability via bot cache, application emojis, then CDN
      const checkCdn = async (id: string, animated = false) => {
        try {
          const ext = animated ? 'gif' : 'png';
          const url = `https://cdn.discordapp.com/emojis/${id}.${ext}`;
          const res = await fetch(url, { method: 'GET' as any });
          return res.ok;
        } catch (e) {
          return false;
        }
      };

      const checkEmojiExists = async (id: string | undefined, animated = false) => {
        if (!id) return false;
        // 1) check guild-wide emoji cache
        if (this.client.emojis.cache.has(id)) return true;
        // 2) check application emojis (emojis uploaded to the application in Dev Portal)
        try {
          if (this.client.application && this.client.application.emojis) {
            // fetch by id; if present, fetch will resolve
            const fetched = await this.client.application.emojis.fetch(id).catch(() => null);
            if (fetched) return true;
          }
        } catch (e) {
          // ignore errors and fallthrough to CDN check
        }
        // 3) fallback to checking CDN URL (useful if emoji is uploaded to app and accessible)
        return await checkCdn(id, animated);
      };

      // check ship tier emojis (parallel)
      const checks = Object.entries(SHIP_TIER_EMOJIS).map(async ([key, tag]) => {
        const parsed = parseEmojiTag(tag);
        const id = parsed?.id;
        const animated = !!parsed?.animated;
        if (await checkEmojiExists(id, animated)) {
          available.push(key);
          return;
        }
        missing.push(key);
      });

      await Promise.all(checks);

      console.log('Emoji diagnostics: ship tier emojis available:', available.length, 'missing:', missing.length);
      if (missing.length > 0) console.log('Missing tier emojis:', missing.join(', '));

      // check top-level EMOJIS (a few critical ones)
      const critical = ['commander', 'rocket', 'fleet', 'resources', 'contribute', 'leaveGuild'];
      await Promise.all(critical.map(async (k) => {
        // @ts-ignore
        const tag = EMOJIS[k];
        const parsed = parseEmojiTag(tag);
        const id = parsed?.id;
        const animated = !!parsed?.animated;
        if (await checkEmojiExists(id, animated)) {
          console.log(`Emoji available: ${k} (${id})`);
          return;
        }
        console.warn(`Emoji MISSING or inaccessible: ${k} (${tag})`);
      }));

    } catch (err) {
      console.error('Emoji diagnostics failed:', err);
    }
  }

  private setupCommands() {
    commands.forEach(command => {
      this.commands.set(command.data.name, command);
    });
  }

  private setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`Stellar Nexus bot is online! Logged in as ${this.client.user?.tag}`);
      // run emoji diagnostics
      this.logEmojiDiagnostics().catch(console.error);
    });

    this.client.on('interactionCreate', async (interaction) => {
      await handleInteraction(interaction, this.commands);
    });
  }

  public async start() {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error('DISCORD_TOKEN environment variable is required');
    }

    try {
      await this.client.login(token);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
      throw error;
    }
  }

  public async deployCommands() {
    const { REST, Routes } = await import('discord.js');
    const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

    try {
      console.log('Started refreshing application (/) commands.');

      const commandData = commands.map(command => command.data.toJSON());

      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: commandData }
      );

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error deploying commands:', error);
    }
  }
}

export const discordBot = new DiscordBot();
