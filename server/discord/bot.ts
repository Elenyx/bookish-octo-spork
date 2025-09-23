import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
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

  private setupCommands() {
    commands.forEach(command => {
      this.commands.set(command.data.name, command);
    });
  }

  private setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`Stellar Nexus bot is online! Logged in as ${this.client.user?.tag}`);
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
