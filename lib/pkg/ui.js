"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigationMenu = exports.toUiNodePartial = void 0;
var elements_markup_1 = require("@ory/elements-markup");
var ui_1 = require("@ory/integrations/ui");
// This helper function translates the html input type to the corresponding partial name.
var toUiNodePartial = function (node) {
    if ((0, ui_1.isUiNodeAnchorAttributes)(node.attributes)) {
        return "ui_node_anchor";
    }
    else if ((0, ui_1.isUiNodeImageAttributes)(node.attributes)) {
        return "ui_node_image";
    }
    else if ((0, ui_1.isUiNodeInputAttributes)(node.attributes)) {
        switch (node.attributes && node.attributes.type) {
            case "hidden":
                return "ui_node_input_hidden";
            case "submit":
                var attrs = node.attributes;
                var isSocial = (attrs.name === "provider" || attrs.name === "link") &&
                    node.group === "oidc";
                return isSocial ? "ui_node_input_social_button" : "ui_node_input_button";
            case "button":
                return "ui_node_input_button";
            case "checkbox":
                return "ui_node_input_checkbox";
            default:
                return "ui_node_input_default";
        }
    }
    else if ((0, ui_1.isUiNodeScriptAttributes)(node.attributes)) {
        return "ui_node_script";
    }
    else if ((0, ui_1.isUiNodeTextAttributes)(node.attributes)) {
        return "ui_node_text";
    }
    return "ui_node_input_default";
};
exports.toUiNodePartial = toUiNodePartial;
/**
 * Renders the navigation bar with state
 * @param session
 * @param logoutUrl
 * @returns
 */
var navigationMenu = function (_a) {
    var navTitle = _a.navTitle, session = _a.session, logoutUrl = _a.logoutUrl, selectedLink = _a.selectedLink;
    var links = [
        {
            name: "Overview",
            href: "welcome",
            iconLeft: "house",
            selected: false,
        },
        {
            name: "Session Information",
            href: "sessions",
            iconLeft: "users-viewfinder",
            selected: false,
        },
    ].map(function (link) {
        if (selectedLink && link.href.includes(selectedLink)) {
            link.selected = true;
        }
        return link;
    });
    return (0, elements_markup_1.Nav)({
        className: "main-nav",
        navTitle: navTitle,
        navSections: [
            {
                links: links,
            },
            {
                title: "Default User Interfaces",
                titleIcon: "circle-question",
                links: [
                    {
                        name: "Sign In",
                        href: "login",
                        iconLeft: "arrow-right-to-bracket",
                        iconRight: "up-right-from-square",
                        disabled: Boolean(session),
                        testId: "login",
                        target: "_blank",
                    },
                    {
                        name: "Sign Up",
                        href: "registration",
                        iconLeft: "arrow-right-to-bracket",
                        iconRight: "up-right-from-square",
                        disabled: Boolean(session),
                        testId: "registration",
                        target: "_blank",
                    },
                    {
                        name: "Account Recovery",
                        href: "recovery",
                        iconLeft: "user-xmark",
                        iconRight: "up-right-from-square",
                        disabled: Boolean(session),
                        testId: "recovery",
                        target: "_blank",
                    },
                    {
                        name: "Account Verification",
                        href: "verification",
                        iconLeft: "user-check",
                        iconRight: "up-right-from-square",
                        disabled: false,
                        testId: "verification",
                        target: "_blank",
                    },
                    {
                        name: "Account Settings",
                        href: "settings",
                        iconLeft: "gear",
                        iconRight: "up-right-from-square",
                        disabled: !Boolean(session),
                        testId: "settings",
                        target: "_blank",
                    },
                    {
                        name: "Log out",
                        href: logoutUrl || "",
                        iconLeft: "arrow-right-to-bracket",
                        iconRight: "up-right-from-square",
                        disabled: !Boolean(session),
                        testId: "logout",
                    },
                ],
            },
        ],
    });
};
exports.navigationMenu = navigationMenu;
