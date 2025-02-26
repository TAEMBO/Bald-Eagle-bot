import type { Collection, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import type { Command } from "#structures";

declare module "discord.js" {
    interface Client {
        readonly chatInputCommands: Collection<string, Command<"chatInput">>;
        readonly contextMenuCommands: Collection<string, Command<"message" | "user">>;
        readonly ytCache: Set<string>;
    }
}

export type CombinedContextMenuCommandInteraction = MessageContextMenuCommandInteraction<"cached"> | UserContextMenuCommandInteraction<"cached">;

interface EntryLink {
    readonly _attributes: {
        readonly rel: string;
        readonly href: string;
    };
}
export interface YTFeedData {
    readonly feed: {
        readonly link: [
            {
                readonly _attributes: {
                    readonly rel: string;
                    readonly href: string;
                };
            },
            {
                readonly _attributes: {
                    readonly rel: string;
                    readonly href: string;
                };
            }
        ];
        readonly title: { readonly _text: string; };
        readonly updated: { readonly _text: string; };
        readonly entry: {
            readonly id: { readonly _text: string; };
            readonly "yt:videoId": { readonly _text: string; };
            readonly "yt:channelId": { readonly _text: string; };
            readonly title: { readonly _text: string; };
            readonly link: EntryLink | EntryLink[];
            readonly author: {
                readonly name: { readonly _text: string; };
                readonly uri: { readonly _text: string; };
            };
            readonly published: { readonly _text: string; };
            readonly updated: { readonly _text: string; };
        };
    };
}