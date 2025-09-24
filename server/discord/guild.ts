import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { storage } from '../storage';
import EMOJIS, { getGuildEmoji, parseEmojiTag, emojiTagToURL } from './emojis';

const guild = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Manage guild membership and activities'),
  
  async execute(interaction: any) {
    try {
      const user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.reply({ content: 'You need to register first! Use `/register`', ephemeral: true });
      }

      const guilds = await storage.getAllGuilds();
      
      if (user.guildId) {
        const userGuild = await storage.getGuild(user.guildId);
        const userGuildEmoji = getGuildEmoji(userGuild, EMOJIS.commander);
        const embed = new EmbedBuilder()
          .setColor(0x8B5CF6)
          .setAuthor({ name: `${userGuild?.name}`, iconURL: emojiTagToURL(userGuildEmoji.display || EMOJIS.commander) })
          .setDescription(`Guild Level: ${userGuild?.level}`)
          // keep Members and Type as separate (non-inline) fields placed below the main description
          .addFields(
            { name: `Members`, value: `${EMOJIS.members}  ${userGuild?.memberCount}/${userGuild?.maxMembers}`, inline: false },
            { name: `Type`, value: `${EMOJIS.type}  ${userGuild?.type || 'Unknown'}`, inline: false }
          );

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            (() => {
              const b = new ButtonBuilder()
                .setCustomId('guild_contribute')
                .setLabel(' Contribute')
                .setStyle(ButtonStyle.Primary);
              const p = parseEmojiTag(EMOJIS.contribute);
              if (p) b.setEmoji({ id: p.id, name: p.name, animated: p.animated });
              return b;
            })(),
            (() => {
              const b = new ButtonBuilder()
                .setCustomId('guild_leave')
                .setLabel(' Leave Guild')
                .setStyle(ButtonStyle.Danger);
              const p = parseEmojiTag(EMOJIS.leaveGuild);
              if (p) b.setEmoji({ id: p.id, name: p.name, animated: p.animated });
              return b;
            })()
          );

        await interaction.reply({ embeds: [embed], components: [actionRow] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0x8B5CF6)
          .setAuthor({ name: 'Available Guilds', iconURL: emojiTagToURL(EMOJIS.availableGuilds) })
          .setDescription('Choose a guild to join:');

        guilds.forEach(g => {
          const gEmoji = getGuildEmoji(g);
          embed.addFields({
            name: `${gEmoji.display ? gEmoji.display + ' ' : ''}${g.name}`,
            value: `**Type**: ${g.type}\n**Level**: ${g.level}\n**Members**: ${g.memberCount}/${g.maxMembers}`,
            inline: true
          });
        });

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('select_guild')
          .setPlaceholder('Select a guild to join');

        guilds.forEach(g => {
          const gEmoji = getGuildEmoji(g);
          const option: any = {
            label: g.name,
            description: `${g.type} - Level ${g.level}`,
            value: g.id
          } as any;
          if (gEmoji.parsed) {
            option.emoji = { id: gEmoji.parsed.id, name: gEmoji.parsed.name, animated: gEmoji.parsed.animated };
          } else if (gEmoji.display) {
            // unicode emoji string
            option.emoji = gEmoji.display;
          }
          selectMenu.addOptions(option);
        });

        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
      }
    } catch (error) {
      console.error('Guild error:', error);
      await interaction.reply({ content: 'Failed to load guild information.', ephemeral: true });
    }
  }
};

export default guild;