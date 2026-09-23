/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 philosolog
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function makeHiddenGuildCss(guildIds: string[]) {
    if (guildIds.length === 0) return "";

    const guildSelectors = guildIds.map(guildId => `[data-list-item-id="guildsnav___${CSS.escape(guildId)}"]`);

    const itemRules = guildSelectors.map(guildSelector =>
        `:where(div, li)[class^="listItem_"]:has(${guildSelector}),\n:where(div, li)[class*=" listItem_"]:has(${guildSelector})`
    ).join(",\n") + " { display: none !important; }";

    // Some guild list containers (eg. an expanded folder's guild list in the BetterFolders sidebar)
    // are frozen at a fixed pixel height for their open/close animation. That height doesn't shrink
    // when a row above is hidden, leaving an empty gap the size of the hidden row, so make the
    // container size to its actual (now smaller) content instead
    // Scoped to uls with an inline height (the frozen animation containers) so we don't
    // stomp the height of unrelated ancestor lists, eg. the main scroller
    // Discord's frozen height is n * (item + gap), ie. it includes one trailing gap after the last
    // item. height: auto only counts n - 1 gaps, so restore the trailing gap as bottom padding to
    // keep folders with hidden servers consistent with the rest
    // The extra data-align/data-justify/data-direction attribute selectors aren't semantically
    // needed (they're already on every match), they just raise our selector's specificity so
    // this reliably beats Discord's own class-based height rule for the same element
    const containerRules = guildSelectors.map(guildSelector =>
        `ul[data-align][data-justify][data-direction][style*="height"]:has(${guildSelector})`
    ).join(",\n") + " { height: auto !important; overflow: visible !important; padding-bottom: var(--space-xs) !important; }";

    return itemRules + "\n" + containerRules;
}
