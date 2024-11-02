import type { Collection, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from "discord.js";
import type { Command } from "#structures";

declare module "discord.js" {
    interface Client {
        readonly chatInputCommands: Collection<string, Command<"chatInput">>;
        readonly contextMenuCommands: Collection<string, Command<"message" | "user">>;
        readonly cachedVideoIds: Set<string>;
        ytCache: string | null;
    }
}

export type CombinedContextMenuCommandInteraction = MessageContextMenuCommandInteraction<"cached"> | UserContextMenuCommandInteraction<"cached">;

interface YTCacheFeedEntry {
    readonly id: { readonly _text: string; };
    readonly "yt:videoId": { readonly _text: string; };
    readonly "yt:channelId": { readonly _text: string; };
    readonly title: { readonly _text: string; };
    readonly link: {
        readonly _attributes: {
            readonly rel: string;
            readonly href: string;
        };
    };
    readonly author: {
        readonly name: { readonly _text: string; };
        readonly uri: { readonly _text: string; };
    };
    readonly published: { readonly _text: string; };
    readonly updated: { readonly _text: string; };
    readonly "media:group": {
        readonly "media:title": { readonly _text: string; };
        readonly "media:content": {
            readonly _attributes: {
                readonly url: string;
                readonly type: string;
                readonly width: string;
                readonly height: string;
            };
        };
        readonly "media:thumbnail": {
            readonly _attributes: {
                readonly url: string;
                readonly width: string;
                readonly height: string;
            };
        };
        readonly "media:description": { readonly _text: string; };
        readonly "media:community": {
            readonly "media:starRating": {
                readonly _attributes: {
                    readonly count: string;
                    readonly average: string;
                    readonly min: string;
                    readonly max: string;
                };
            };
            readonly "media:statistics": {
                readonly _attributes: { readonly views: string; };
            };
        };
    };
}

export interface YTCacheFeed {
    readonly feed: {
        readonly _attributes: {
            readonly "xmlns:yt": string;
            readonly "xmlns:media": string;
            readonly xmlns: string;
        };
        readonly link: {
            readonly _attributes: {
                readonly rel: string;
                readonly href: string;
            };
        }[];
        readonly id: { readonly _text: string; };
        readonly title: { readonly _text: string; };
        readonly author: {
            readonly name: { readonly _text: string; };
            readonly uri: { readonly _text: string; };
        };
        readonly published: { readonly _text: string; };
        readonly entry: YTCacheFeedEntry[];
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
            readonly link: {
                readonly _attributes: {
                    readonly rel: string;
                    readonly href: string;
                };
            };
            readonly author: {
                readonly name: { readonly _text: string; };
                readonly uri: { readonly _text: string; };
            };
            readonly published: { readonly _text: string; };
            readonly updated: { readonly _text: string; };
        };
    };
}