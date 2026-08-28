/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 philosolog
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Guild } from "@vencord/discord-types";
import { Forms, GuildStore, Menu, React, useStateFromStores } from "@webpack/common";

const STYLE_ID = "vc-hide-servers-rules";

export function makeHiddenGuildCss(guildIds: string[]) {
    if (guildIds.length === 0) return "";

    return guildIds.flatMap(guildId => {
        const guildSelector = `[data-list-item-id="guildsnav___${CSS.escape(guildId)}"]`;

        return [
            `[class*="listItem_"]:has(${guildSelector})`,
            `[class*="listItem-"]:has(${guildSelector})`
        ];
    }).join(",\n") + " { display: none !important; }";
}

const settings = definePluginSettings({
    hiddenGuilds: {
        type: OptionType.CUSTOM,
        default: [] as string[]
    },
    hiddenServers: {
        type: OptionType.COMPONENT,
        component: HiddenServers
    }
});

function updateHiddenServerStyle() {
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

    if (!style) {
        style = document.createElement("style");
        style.id = STYLE_ID;
        document.head.append(style);
    }

    style.textContent = makeHiddenGuildCss(settings.store.hiddenGuilds);
}

function setGuildHidden(guildId: string, hidden: boolean) {
    const { hiddenGuilds } = settings.store;
    const index = hiddenGuilds.indexOf(guildId);

    if (hidden && index === -1) hiddenGuilds.push(guildId);
    if (!hidden && index !== -1) hiddenGuilds.splice(index, 1);

    updateHiddenServerStyle();
}

function HiddenServers() {
    const { hiddenGuilds } = settings.use(["hiddenGuilds"]);
    const guilds = useStateFromStores([GuildStore], () => GuildStore.getGuilds());

    if (hiddenGuilds.length === 0) {
        return <Forms.FormText>No servers are hidden.</Forms.FormText>;
    }

    return (
        <section className="vc-hide-servers-settings">
            <Forms.FormTitle tag="h3">Hidden servers</Forms.FormTitle>
            <Forms.FormText>Servers hidden from your server list. Use Show to restore one.</Forms.FormText>
            <div className="vc-hide-servers-list">
                {hiddenGuilds.map(guildId => (
                    <div className="vc-hide-servers-row" key={guildId}>
                        <div className="vc-hide-servers-name">
                            <strong>{guilds[guildId]?.name ?? "Unknown server"}</strong>
                            <span>{guildId}</span>
                        </div>
                        <Button size="small" variant="secondary" onClick={() => setGuildHidden(guildId, false)}>
                            Show
                        </Button>
                    </div>
                ))}
            </div>
        </section>
    );
}

const patchGuildContextMenu: NavContextMenuPatchCallback = (children, { guild }: { guild?: Guild; }) => {
    if (!guild) return;

    const hidden = settings.store.hiddenGuilds.includes(guild.id);
    const item = (
        <Menu.MenuItem
            id="vc-hide-server"
            label={hidden ? "Show Server" : "Hide Server"}
            action={() => setGuildHidden(guild.id, !hidden)}
        />
    );
    const group = findGroupChildrenByChildId("privacy", children);

    if (group) group.push(item);
    else children.push(<Menu.MenuGroup>{item}</Menu.MenuGroup>);
};

export default definePlugin({
    name: "HideServers",
    description: "Hide servers from the server list using their right-click context menu",
    authors: [Devs.philosolog],
    tags: ["Servers", "Customisation"],
    settings,
    contextMenus: {
        "guild-context": patchGuildContextMenu,
        "guild-header-popout": patchGuildContextMenu
    },
    start: updateHiddenServerStyle,
    stop() {
        document.getElementById(STYLE_ID)?.remove();
    }
});
