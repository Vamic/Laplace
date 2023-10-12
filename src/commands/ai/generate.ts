import { AttachmentBuilder, EmbedBuilder, Interaction, Message, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import { extractContent, log } from "../../util";
import { ImageGenerateParams } from "openai/resources/images.mjs";

function extractPrompt(action: Interaction | Message): string | undefined {
    if (action instanceof Message) {
        return extractContent(action);
    }
    if ('options' in action) {
        return action.options.get("input")?.value as string;
    }
}

const Generate: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Replies with a generated image from DALL-E')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(true)
            .setName("input")
            .setDescription("prompt")),

    canExecute: isRepliable,

    execute: async (trigger) => {
        const { action } = trigger;

        if (!action.client.storage?.ai?.openai) {
            await trigger.reply("OpenAI isn't initialized.");
            return;
        }
        const prompt = extractPrompt(action);
        if (!prompt) {
            await trigger.reply("Gonna need a prompt man");
            return;
        }
        log(`Generating '${prompt}'`);
        if ('deferReply' in action) {
            await action.deferReply();
        }
        const params: ImageGenerateParams = { prompt, n: 1, response_format: "b64_json", size: "256x256", user: action.member?.user.id };
        const response = await action.client.storage.ai.openai.images.generate(params);
        const imageData = response.data?.[0]?.b64_json;
        if (!imageData) {
            await trigger.followUpOrReply("Couldn't generate the image for some reason");
            return;
        }
        const imageBuffer = Buffer.from(imageData, 'base64');
        const attachment = new AttachmentBuilder(imageBuffer).setName("generated.png");
        await trigger.followUpOrReply({ content: `\`${prompt}\``, files: [attachment], ephemeral: false });
    }
}

export default { command: Generate };