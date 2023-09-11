// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { Session } from "@ory/client"
import { Nav } from "@ory/elements-markup"

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
