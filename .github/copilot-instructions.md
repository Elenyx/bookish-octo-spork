<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [ ] Verify that the copilot-instructions.md file in the .github directory is created.

- [ ] Clarify Project Requirements
	<!-- Ask for project type, language, and frameworks if not specified. Skip if already provided. -->

- [ ] Scaffold the Project
	<!--
	Ensure that the previous step has been marked as completed.
	Call project setup tool with projectType parameter.
	Run scaffolding command to create project files and folders.
	Use '.' as the working directory.
	If no appropriate projectType is available, search documentation using available tools.
	Otherwise, create the project structure manually using available file creation tools.
	-->

- [ ] Customize the Project
	<!--
	Verify that all previous steps have been completed successfully and you have marked the step as completed.
	Develop a plan to modify codebase according to user requirements.
	Apply modifications using appropriate tools and user-provided references.
	Skip this step for "Hello World" projects.
	-->

- [ ] Install Required Extensions
	<!-- ONLY install extensions provided mentioned in the get_project_setup_info. Skip this step otherwise and mark as completed. -->

- [ ] Compile the Project
	<!--
	Verify that all previous steps have been completed.
	Install any missing dependencies.
	Run diagnostics and resolve any issues.
	Check for markdown files in project folder for relevant instructions on how to do this.
	-->

- [ ] Create and Run Task
	<!--
	Verify that all previous steps have been completed.
	Check https://code.visualstudio.com/docs/debugtest/tasks to determine if the project needs a task. If so, use the create_and_run_task to create and launch a task based on package.json, README.md, and project structure.
	Skip this step otherwise.
	 -->

- [ ] Launch the Project
	<!--
	Verify that all previous steps have been completed.
	Prompt user for debug mode, launch only if confirmed.
	 -->

- [ ] Ensure Documentation is Complete
	<!--
	Verify that all previous steps have been completed.
	Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
	Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.
	 -->

<!--
## Execution Guidelines
PROGRESS TRACKING:
- If any tools are available to manage the above todo list, use it to track progress through this checklist.
- After completing each step, mark it complete and add a summary.
- Read current todo list status before starting each new step.

COMMUNICATION RULES:
- Avoid verbose explanations or printing full command outputs.
- If a step is skipped, state that briefly (e.g. "No extensions needed").
- Do not explain project structure unless asked.
- Keep explanations concise and focused.

DEVELOPMENT RULES:
- Use '.' as the working directory unless user specifies otherwise.
- Avoid adding media or external links unless explicitly requested.
- Use placeholders only with a note that they should be replaced.
- Use VS Code API tool only for VS Code extension projects.
- Once the project is created, it is already opened in Visual Studio Code—do not suggest commands to open this project in Visual Studio again.
- If the project setup information has additional rules, follow them strictly.

FOLDER CREATION RULES:
- Always use the current directory as the project root.
- If you are running any terminal commands, use the '.' argument to ensure that the current working directory is used ALWAYS.
- Do not create a new folder unless the user explicitly requests it besides a .vscode folder for a tasks.json file.
- If any of the scaffolding commands mention that the folder name is not correct, let the user know to create a new folder with the correct name and then reopen it again in vscode.

EXTENSION INSTALLATION RULES:
- Only install extension specified by the get_project_setup_info tool. DO NOT INSTALL any other extensions.

PROJECT CONTENT RULES:
- If the user has not specified project details, assume they want a "Hello World" project as a starting point.
- Avoid adding links of any type (URLs, files, folders, etc.) or integrations that are not explicitly required.
- Avoid generating images, videos, or any other media files unless explicitly requested.
- If you need to use any media assets as placeholders, let the user know that these are placeholders and should be replaced with the actual assets later.
- Ensure all generated components serve a clear purpose within the user's requested workflow.
- If a feature is assumed but not confirmed, prompt the user for clarification before including it.
- If you are working on a VS Code extension, use the VS Code API tool with a query to find relevant VS Code API references and samples related to that query.

TASK COMPLETION RULES:
- Your task is complete when:
  - Project is successfully scaffolded and compiled without errors
  - copilot-instructions.md file in the .github directory exists in the project
  - README.md file exists and is up to date
  - User is provided with clear instructions to debug/launch the project

Before starting a new task in the above plan, update progress in the plan.
-->
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.

---

# Display Components

While you might be familiar with embeds in Discord, there are more ways to style and format your app messages using **display components**, a comprehensive set of layout and content elements.

To use the display components, you need to pass the **IsComponentsV2** message flag (`MessageFlags`) when sending a message. You only need to use this flag when sending a message using the display components system, not when deferring interaction responses.

---

## ⚠️ WARNING

Opting into using this system by passing `IsComponentsV2` comes with a set of caveats:

- You **cannot** send content, poll, embeds, or stickers.
- You **cannot opt out** of using display components when editing a message.
- You **can opt in** to using display components when editing a message while explicitly setting content, poll, embeds, and stickers to `null`.
- Messages can have up to **40 total components** (nested components count!).
- The amount of text across all text display components cannot exceed **4000 characters**.
- All attached files must explicitly be referenced in a component (e.g., Thumbnail, Media Gallery, File).
- All components can be passed an optional, unique `id` field (32-bit integer). This is different from `custom_id` for interactive components.
- If `id` is not specified, Discord will automatically assign sequential values starting from 1. (`id: 0` is treated as empty).

If you want to work with the `id` (e.g., find and replace content later), you should **explicitly specify it**.

---

## # Text Display

Text Display components let you add **markdown-formatted text** to your message. They replace the `content` field when opting into display components.

### ⚠️ DANGER

Sending **user and role mentions** in text display components will **notify** them! You should control mentions with the `allowedMentions` option.

**Example:**

```js
const { TextDisplayBuilder, MessageFlags } = require('discord.js');

const exampleTextDisplay = new TextDisplayBuilder()
 .setContent('This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.');

await channel.send({
 components: [exampleTextDisplay],
 flags: MessageFlags.IsComponentsV2,
});
```

---

## # Section

Sections represent text (1–3 Text Displays) with an **accessory** (image thumbnail or button).

**Example:**

```js
const { SectionBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const exampleSection = new SectionBuilder()
 .addTextDisplayComponents(
  textDisplay => textDisplay
   .setContent('This text is inside a Text Display component!'),
  textDisplay => textDisplay
   .setContent('Using a section, you may only use up to three Text Display components.'),
  textDisplay => textDisplay
   .setContent('And you can place one button or one thumbnail component next to it!'),
 )
 .setButtonAccessory(
  button => button
   .setCustomId('exampleButton')
   .setLabel('Button inside a Section')
   .setStyle(ButtonStyle.Primary),
 );

await channel.send({
 components: [exampleSection],
 flags: MessageFlags.IsComponentsV2,
});
```

---

## # Thumbnail

A Thumbnail is similar to the `thumbnail` field in embeds. Thumbnails are added as **accessories inside a Section**, support alt text, and can be marked as spoilers.

**Example:**

```js
const { AttachmentBuilder, SectionBuilder, MessageFlags } = require('discord.js');

const file = new AttachmentBuilder('../assets/image.png');

const exampleSection = new SectionBuilder()
 .addTextDisplayComponents(
  textDisplay => textDisplay
   .setContent('This text is inside a Text Display component!'),
 )
 .setThumbnailAccessory(
  thumbnail => thumbnail
   .setDescription('alt text displaying on the image')
   .setURL('attachment://image.png'),
 );

await channel.send({
 components: [exampleSection],
 files: [file],
 flags: MessageFlags.IsComponentsV2,
});
```

---

## # Media Gallery

A Media Gallery displays a grid of up to **10 media attachments**. Each item can have optional alt text and be marked as a spoiler.

**Example:**

```js
const { AttachmentBuilder, MediaGalleryBuilder, MessageFlags } = require('discord.js');

const file = new AttachmentBuilder('../assets/image.png');

const exampleGallery = new MediaGalleryBuilder()
 .addItems(
  mediaGalleryItem => mediaGalleryItem
   .setDescription('alt text displaying on an image from the AttachmentBuilder')
   .setURL('attachment://image.png'),
  mediaGalleryItem => mediaGalleryItem
   .setDescription('alt text displaying on an image from an external URL')
   .setURL('https://i.imgur.com/AfFp7pu.png')
   .setSpoiler(true),
 );

await channel.send({
 components: [exampleGallery],
 files: [file],
 flags: MessageFlags.IsComponentsV2,
});
```

---

## # File

A File component displays an **uploaded file** within the message body. Multiple `File` components can be used in a single message.

**Example:**

```js
const { AttachmentBuilder, FileBuilder, MessageFlags } = require('discord.js');

const file = new AttachmentBuilder('../assets/guide.pdf');

const exampleFile = new FileBuilder()
 .setURL('attachment://guide.pdf');

await channel.send({
 components: [exampleFile],
 files: [file],
 flags: MessageFlags.IsComponentsV2,
});
```

---

## # Separator

A Separator adds vertical padding and an optional **visual divider** between components.

### ⚠️ SEPARATOR WARNING

If a Separator is used **without any other components**, the message will have no visible content.

**Example:**

```js
const { TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');

const exampleTextDisplay = new TextDisplayBuilder()
 .setContent('This is inside a Text Display component!');

const exampleSeparator = new SeparatorBuilder()
 .setDivider(false)
 .setSpacing(SeparatorSpacingSize.Large);

await channel.send({
 components: [exampleTextDisplay, exampleSeparator, exampleTextDisplay],
 flags: MessageFlags.IsComponentsV2,
});
```

---

## # Container

A Container groups child components inside a **rounded box** with optional accent color (similar to embeds). Containers can be marked as **spoilers**.

**Example:**

```js
const { ContainerBuilder, UserSelectMenuBuilder, ButtonStyle, MessageFlags } = require('discord.js');

const exampleContainer = new ContainerBuilder()
 .setAccentColor(0x0099FF)
 .addTextDisplayComponents(
  textDisplay => textDisplay
   .setContent('This text is inside a Text Display component!'),
 )
 .addActionRowComponents(
  actionRow => actionRow
   .setComponents(
    new UserSelectMenuBuilder()
     .setCustomId('exampleSelect')
     .setPlaceholder('Select users'),
   ),
 )
 .addSeparatorComponents(
  separator => separator,
 )
 .addSectionComponents(
  section => section
   .addTextDisplayComponents(
    textDisplay => textDisplay
     .setContent('This is inside a Text Display component!'),
    textDisplay => textDisplay
     .setContent('And you can place one button or one thumbnail next to it!'),
   )
   .setButtonAccessory(
    button => button
     .setCustomId('exampleButton')
     .setLabel('Button inside a Section')
     .setStyle(ButtonStyle.Primary),
   ),
 );

await channel.send({
 components: [exampleContainer],
 flags: MessageFlags.IsComponentsV2,
});
```
