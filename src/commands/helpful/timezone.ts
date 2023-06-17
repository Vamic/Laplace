import { EmbedBuilder, Message } from "discord.js";
import { BotCommand } from "../../types/bot-command";
import { error } from "../../util/log";
import timezoneData from "./data/timezones.json";

const timezones: Array<Timezone> = timezoneData.map(tz => tz.abbreviaton.length > 1 ? tz : null).filter(Boolean) as Array<Timezone>;
const tzAbbrevations = timezones.map(tz => tz.abbreviaton);

const timezoneRegex = /^((?:1[0-2]|0?\d)(?::[0-5][0-9])? ?[AP]M |24:00 |(?:2[0-3]|[01]?[0-9])(?::[0-5][0-9])?)? ?([a-zA-Z]{1,4}|(?:GMT|UTC) ?[+-][01]?\d) to ([a-zA-Z]{1,4}|(?:GMT|UTC) ?[+-][01]?\d)$/i;

interface Timezone {
    abbreviaton: string,
    name: string,
    locations: [
        string
    ],
    utc_relation: string,
    offset: number,
    alternate: boolean
}

async function calculateTimezoneDiff(time: string, from: string, to: string) {
    let result = {
        extramsg: "",
        offset: 0,
        input_time: time,
        time: time,
        dayoffset: 0,
        from: undefined as Timezone | undefined,
        to: undefined as Timezone | undefined
    };
    if (/(?:GMT|UTC) ?[+-][01]?\d/i.test(from)) {
        result.from = timezones.find(tz => tz.utc_relation.split(" ")[1] == from.replace(/UTC ?|GMT ?/i, ""));
    } else {
        result.from = timezones.find(tz => tz.abbreviaton == from && tz.alternate == false);
        if (!result.from)
            result.from = timezones.find(tz => tz.abbreviaton == from);
    }
    if (!result.from) {
        throw `Input timezone "${from}" was not found.`;
    }
    if (/(?:GMT|UTC) ?[+-][01]?\d/i.test(to)) {
        result.to = timezones.find(tz => tz.utc_relation.split(" ")[1] == to.replace(/UTC ?|GMT ?/i, ""));
    } else {
        result.to = timezones.find(tz => tz.abbreviaton == to && tz.alternate == false);
        if (!result.to)
            result.to = timezones.find(tz => tz.abbreviaton == to);
    }
    if (!result.to) {
        throw `Input timezone "${to}" was not found.`;
    }
    result.offset = result.to.offset - result.from.offset;
    if (!time) {
        return result;
    }
    let pureTime = time.replace(/AM|PM/i, "");
    let hours: number | string = Number(pureTime.split(":")[0])
    if (/PM/i.test(time)) hours += 12;
    let minutes: number | string = Number(pureTime.split(":")[1] || 0);
    result.input_time = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);

    //Add the time difference
    hours += Math.floor(result.offset);
    minutes += (result.offset % 1) * 60;

    //Transfer time between hours/minutes so minutes is in range 0-59
    if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
    } else if (minutes < 0) {
        hours--;
        minutes += 60;
    }

    //Transfer time between hours/days so hours is in range 0-23
    if (hours >= 24) {
        result.dayoffset = Math.floor(hours / 24);
        hours = hours % 24;
    }
    while (hours < 0) {
        result.dayoffset--;
        hours += 24;
    }

    //Make them two digits
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    result.time = hours + ":" + minutes;

    return result;
}

const Timezones: BotCommand = {
    command: { name: "Timezones" },

    matchOnCanExecute: true,

    canExecute: ({ action }) => {
        if (!(action instanceof Message) || !isNaN(action.content as any)) {
            return false;
        }
        const parts = timezoneRegex.exec(action.content.toUpperCase());
        return !!(parts &&
            (tzAbbrevations.indexOf(parts[2]!) > -1 || /(?:GMT|UTC) ?[+-][01]?\d/i.test(parts[2]!)) &&
            (tzAbbrevations.indexOf(parts[3]!) > -1 || /(?:GMT|UTC) ?[+-][01]?\d/i.test(parts[3]!)));
    },

    execute: async (trigger) => {
        const { action } = trigger;

        if (!(action instanceof Message)) {
            return;
        }

        let input = action.content;
        let args = timezoneRegex.exec(input)!;
        args.shift();
        const time = args.shift()!;
        const from = args.shift()!.toUpperCase();
        const to = args.shift()!.toUpperCase();
        try {
            let result = await calculateTimezoneDiff(time, from, to);

            if (!result.to || !result.from) {
                return;
            }

            var em = new EmbedBuilder();
            if (!result.time) {
                var to_name = "`" + result.to.name + "`";
                var fromname = "`" + result.from.name + "`";
                var hours = Math.abs(result.offset);
                var ahead_or_behind = result.offset < 0 ? "behind" : "ahead of";

                em.setDescription(`${to_name} is ${hours} hours ${ahead_or_behind} ${fromname}`)
                    .addFields([
                        { name: "To", value: result.to.abbreviaton + " (" + result.to.locations.join(", ") + ")", inline: true },
                        { name: "From", value: result.from.abbreviaton + " (" + result.from.locations.join(", ") + ")", inline: true }
                    ]);
            }
            else {
                var old_time = result.input_time + " " + result.from.abbreviaton;
                var new_time = result.time + " " + result.to.abbreviaton;
                var previous_or_next = result.dayoffset == -1 ? "previous" : result.dayoffset == 1 ? "next" : "same";

                em.setDescription(`**${old_time}** is **${new_time}**, the ${previous_or_next} day.`)
                    .addFields([
                        { name: "From", value: result.from.abbreviaton + " (" + result.from.locations.join(", ") + ")", inline: true },
                        { name: "To", value: result.to.abbreviaton + " (" + result.to.locations.join(", ") + ")", inline: true }
                    ]);
            }
            await trigger.reply({ embeds: [em] });
        }
        catch (err) {
            error(err as any);
        }
    }
}

export default { command: Timezones };