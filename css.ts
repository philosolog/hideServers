/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 philosolog
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function makeHiddenGuildCss(guildIds: string[]) {
    if (guildIds.length === 0) return "";

    const rowSelectors = guildIds.flatMap(guildId => {
        const guildSelector = `[data-list-item-id="guildsnav___${CSS.escape(guildId)}"]`;

        return [
            `:where(div, li)[class^="listItem_"]:has(${guildSelector})`,
            `:where(div, li)[class*=" listItem_"]:has(${guildSelector})`
        ];
    });
    const folderSelectors = rowSelectors.map(rowSelector => `ul:has(> ${rowSelector})`);

    return `${rowSelectors.join(",\n")} { display: none !important; }\n` +
        `${folderSelectors.join(",\n")} { height: auto !important; }`;
}
