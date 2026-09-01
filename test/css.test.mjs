/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 philosolog
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert/strict";
import test from "node:test";

globalThis.CSS = {
    escape(value) {
        return value;
    }
};

// eslint-disable-next-line path-alias/no-relative
const { makeHiddenGuildCss } = await import("../css.ts");

test("hidden guilds do not leave space in expanded folders", () => {
    const css = makeHiddenGuildCss(["hidden-guild"]);

    assert.match(css, /display: none !important/);
    assert.match(
        css,
        /ul.*:has\(.*guildsnav___hidden-guild.*\).*height: auto !important/s
    );
});
