// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { UiNodeInputAttributes, UiNode, Session } from "@ory/client"
import { Nav } from "@ory/elements-markup"
import {
  isUiNodeAnchorAttributes,
  isUiNodeImageAttributes,
  isUiNodeInputAttributes,
  isUiNodeScriptAttributes,
  isUiNodeTextAttributes,
} from "@ory/integrations/ui"

// This helper function translates the html input type to the corresponding partial name.
export const toUiNodePartial = (node: UiNode) => {
  if (isUiNodeAnchorAttributes(node.attributes)) {
    return "ui_node_anchor"
  } else if (isUiNodeImageAttributes(node.attributes)) {
    return "ui_node_image"
  } else if (isUiNodeInputAttributes(node.attributes)) {
    switch (node.attributes && node.attributes.type) {
      case "hidden":
        return "ui_node_input_hidden"
      case "submit":
        const attrs = node.attributes as UiNodeInputAttributes
        const isSocial =
          (attrs.name === "provider" || attrs.name === "link") &&
          node.group === "oidc"

        return isSocial ? "ui_node_input_social_button" : "ui_node_input_button"
      case "button":
        return "ui_node_input_button"
      case "checkbox":
        return "ui_node_input_checkbox"
      default:
        return "ui_node_input_default"
    }
  } else if (isUiNodeScriptAttributes(node.attributes)) {
    return "ui_node_script"
  } else if (isUiNodeTextAttributes(node.attributes)) {
    return "ui_node_text"
  }
  return "ui_node_input_default"
}

type NavigationMenuProps = {
  navTitle: string
  session?: Session
  logoutUrl?: string
  selectedLink?: "welcome" | "sessions"
}
/**
 * Renders the navigation bar with state
 * @param session
 * @param logoutUrl
 * @returns
 */
export const navigationMenu = ({
  navTitle,
  session,
  logoutUrl,
  selectedLink,
}: NavigationMenuProps) => {
  const links = [
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
  ].map((link) => {
    if (selectedLink && link.href.includes(selectedLink)) {
      link.selected = true
    }
    return link
  })

  return Nav({
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
  })
}
