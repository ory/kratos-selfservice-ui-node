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

/**
 * Renders the navigation bar with state
 * @param session
 * @param logoutUrl
 * @returns
 */
export const navigationMenu = (
  session?: Session,
  logoutUrl?: string,
  selectedLink?: "welcome" | "sessions",
) => {
  const links = [
    {
      name: "Overview",
      url: "/welcome",
      iconLeft: "house",
      selected: false,
    },
    {
      name: "Session Information",
      url: "/sessions",
      iconLeft: "users-viewfinder",
      selected: false,
    },
  ].map((link) => {
    if (selectedLink && link.url.includes(selectedLink)) {
      link.selected = true
    }
    return link
  })

  return Nav({
    className: "welcome-nav",
    navTitle: "Project Name",
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
            url: "/login",
            iconLeft: "arrow-right-to-bracket",
            iconRight: "up-right-from-square",
            disabled: Boolean(session),
            testId: "login",
          },
          {
            name: "Sign Up",
            url: "/registration",
            iconLeft: "arrow-right-to-bracket",
            iconRight: "up-right-from-square",
            disabled: Boolean(session),
            testId: "registration",
          },
          {
            name: "Account Recovery",
            url: "/recovery",
            iconLeft: "user-xmark",
            iconRight: "up-right-from-square",
            disabled: Boolean(session),
            testId: "recovery",
          },
          {
            name: "Account Verification",
            url: "/verification",
            iconLeft: "user-check",
            iconRight: "up-right-from-square",
            disabled: !Boolean(session),
            testId: "verification",
          },
          {
            name: "Account Settings",
            url: "/settings",
            iconLeft: "gear",
            iconRight: "up-right-from-square",
            disabled: !Boolean(session),
            testId: "settings",
          },
          {
            name: "Logout",
            url: logoutUrl || "",
            iconLeft: "arrow-right-to-bracket",
            iconRight: "up-right-from-square",
            disabled: !Boolean(session),
            testId: "logout",
          },
        ],
      },
      {
        floatBottom: true,
        links: [
          {
            name: "Fork this on GitHub",
            url: "https://github.com/ory/kratos-selfservice-ui-node",
            iconLeft: "code-fork",
            iconRight: "up-right-from-square",
          },
        ],
      },
    ],
  })
}
