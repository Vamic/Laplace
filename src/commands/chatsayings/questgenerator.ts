import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import verbs from "./questgenerator/verbs.json";
import locations from "./questgenerator/locations.json";
import items from "./questgenerator/items.json";
import creatures from "./questgenerator/creatures.json";
import nouns from "./questgenerator/nouns.json";
import adjectives from "./questgenerator/adjectives.json";

//Returns a string containing the quest objective
var GenerateQuest = function () {
    let validQuestTargets = [locations, items, creatures];

    let targetType = GetRandomInt(validQuestTargets.length);
    let targetIsLocation = (targetType == 0);
    let targetIsMultipleThings = Math.random() < 0.25; //0 to 1, 0% chance to 100% chance 
    let targetHasAppender = Math.random() < 0.25;
    let targetHasPrepender = Math.random() < 0.2;

    let quest = GetRandomElement(verbs);

    let targetCount = (Math.random() < 0.5 ? " the" : "");
    //If multiple targets, changes " the " to " 7x ", for example, to show how many targets are needed for the quest
    if (targetIsMultipleThings && !targetIsLocation) {
        targetCount = " " + (GetRandomInt(10) + 2) + "x";
    }

    quest += targetCount + " ";
    quest += (targetHasPrepender ? GetRandomElement(adjectives) + " " : ""); //Turns target/item "Flower" into "Magic Flower"
    quest += GetRandomElement(validQuestTargets[targetType]!)!;
    quest += (targetHasAppender ? " of " + GetRandomElement(nouns) : ""); //Same as above but other side, e.g. "Flower of Doom"

    return quest
}

//Returns a string containing the quest reward
var GenerateReward = function () {
    let rewardXP = (GetRandomInt(1000) + 1) * 10;
    let rewardGold = (GetRandomInt(100) + 1) * 10;

    let rewardHasGold = Math.random() < 0.6; //0 to 1, 0% chance to 100% chance 
    let rewardHasItem = Math.random() < 0.2;
    let rewardIsSingleItem = Math.random() < 0.2;
    let rewardItemHasPrepender = Math.random() < 0.2;
    let rewardItemHasAppender = Math.random() < 0.2;

    let reward = rewardXP + " XP";

    if (rewardHasGold) reward += ", " + rewardGold + " Gold Pieces";

    if (rewardHasItem) {
        reward += ", " + (rewardIsSingleItem ? "" : (GetRandomInt(10) + 2) + "x ");

        reward += (rewardItemHasPrepender ? GetRandomElement(adjectives) + " " : "");
        reward += GetRandomElement(items);
        reward += (rewardItemHasAppender ? " of " + GetRandomElement(nouns) : "");
    }

    return reward
}

var GetRandomElement = function<T> (arr: Array<T>) {
    return arr[Math.floor(Math.random() * arr.length)];
}
//0 (inclusive) to max (exclusive)
var GetRandomInt = function (max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

const Quest: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('quest')
        .setDescription('Get a randomly generated quest'),

    canExecute: isRepliable,

    execute: async (trigger) => {
        await trigger.reply("Quest: " + GenerateQuest() +
            "\nReward: " + GenerateReward());
    }
}

export default { command: Quest };