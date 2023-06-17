import { GuildMember, Interaction, Message, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { isRepliable } from "../../types/command-conditions";
import { extractContent } from "../../util/message-helpers";

var getRandomInt = function (min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

var argFilter = function (arg: string) {
    return /\d/.test(arg);
}

var parseRoll = function (input: string, results: Array<number> | undefined, negative?: boolean) {
    //Initialize results if we're not adding to existing results
    if (!results) results = [];
    //Find d so we can do dice rolls
    if (input.indexOf("d") > -1) {
        //Get the amount and size
        var diceParts = input.split('d').map(Number);
        //If theres no amount, set it to 1
        if (!diceParts[0]) diceParts[0] = 1;

        //For each die, do a roll
        for (var i = 0; i < diceParts[0]; i++) {
            //Roll from 1 to dice size
            var roll = getRandomInt(1, diceParts[1]!);

            //Add to results
            if (negative) results.push(-1 * roll);
            else results.push(roll);
        }
        //Theres no d so its a static number probably, just add it
    } else {
        if (negative) results.push(-1 * parseInt(input));
        else results.push(parseInt(input));
    }
    return results;
};

var rollDice = function (input: string): [number, number[], string] {
    //Default to a d20
    if (!input) input = "1d20";
    //Default to a d20 with the input as the modifier
    else if (input[0] === "+" || input[0] === "-") input = "1d20" + input;
    //If input is a number, make a die out of it
    else if (!isNaN(input as any)) input = "1d" + input;

    //Initialize variables
    var i;
    var results: Array<number> = [];
    var parsedInput = input.split("+"); //Split on + ex: 2d8 + 1d4
    var totalScore = 0;

    //Go through each part
    for (var diceIndex = 0; diceIndex < parsedInput.length; diceIndex++) {

        //Get the current part
        var diceRoll = parsedInput[diceIndex]!;
        var negativeRolls = []; //Array of negative rolls

        //Check if theres a negative somewhere in this part
        if (diceRoll.indexOf("-") > -1) {
            //Split on -
            var diceRolls = diceRoll.split("-");
            for (i = 0; i < diceRolls.length; i++) {
                if (i === 0) {
                    //Set current roll to the first part
                    diceRoll = diceRolls[i]!;
                } else {
                    //Sort to the negative rolls
                    negativeRolls.push(diceRolls[i]);
                }
            }
        }
        //Roll and add to results
        results = parseRoll(diceRoll, results);
        //If we got any negative rolls, roll those as well
        for (i = 0; i < negativeRolls.length; i++) {
            results = parseRoll(negativeRolls[i]!, results, true);
        }
    }
    //Calculate total roll
    for (i = 0; i < results.length; i++) {
        totalScore += results[i]!;
    }
    return [totalScore, results, input];
};


function getInput(action: Interaction | Message): string {
    if (action instanceof Message) {
        return extractContent(action);
    }
    if ('options' in action) {
        return action.options.get("input")?.value as string ?? "";
    }
    return "";
}

const Roll: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll dice, defaults to a d20')
        .addStringOption(new SlashCommandStringOption()
            .setRequired(false)
            .setName("input")
            .setDescription("dice to roll, ex: `1d6` or `2d20 +4`")),

    canExecute: isRepliable,

    execute: async (trigger) => {
        const { action } = trigger;
        const { member } = action;
        var user = member instanceof GuildMember ? member.displayName : "You";

        var input = getInput(action).toLowerCase();
        //Remove whitespace between +- and the next character
        input = input.replace(/\+\s+/g, "+");
        input = input.replace(/-\s+/g, "-");
        input = input.split(" ").filter(argFilter).join(" ");

        const [final, parts, originalInput] = rollDice(input);

        //Join the results for display
        var joinedParts = parts.join(", ");
        //What the user typed in
        await trigger.reply(user + " rolled " + originalInput
            //Show result
            + ": **" + final + "**"
            //Show the individual dice rolls if its not too many
            + (parts.length === 1 || joinedParts.length > 100 ? "" : " (" + joinedParts + ")"));
    }
}

export default { command: Roll };