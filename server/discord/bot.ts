import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import EMOJIS, { SHIP_TIER_EMOJIS } from './emojis';
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

      // check ship tier emojis
      Object.entries(SHIP_TIER_EMOJIS).forEach(([key, tag]) => {
        const match = /:(\d+)>$/.exec(tag);
        const id = match ? match[1] : null;
        if (id && this.client.emojis.cache.has(id)) {
          available.push(key);
        } else {
          missing.push(key);
        }
      });

      console.log('Emoji diagnostics: ship tier emojis available:', available.length, 'missing:', missing.length);
      if (missing.length > 0) console.log('Missing tier emojis:', missing.join(', '));

      // check top-level EMOJIS (a few critical ones)
      const critical = ['commander', 'rocket', 'fleet', 'resources', 'contribute', 'leaveGuild'];
      critical.forEach(k => {
        // @ts-ignore
        const tag = EMOJIS[k];
        const match = tag && /:(\d+)>$/.exec(tag);
        const id = match ? match[1] : null;
        if (id && this.client.emojis.cache.has(id)) {
          console.log(`Emoji available: ${k} (${id})`);
        } else {
          console.warn(`Emoji MISSING or inaccessible: ${k} (${tag})`);
        }
      });
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
