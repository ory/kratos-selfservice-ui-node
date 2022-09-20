import { Card } from "@ory/elements-markup"

import {
  defaultConfig,
  RouteCreator,
  RouteRegistrator,
  setSession,
} from "../pkg"
import { navigationMenu } from "../pkg/ui"

export const createWelcomeRoute: RouteCreator =
  (createHelpers) => async (req, res) => {
    res.locals.projectName = "Welcome to Ory"

    const { sdk } = createHelpers(req)
    const session = req.session

    // Create a logout URL
    const logoutUrl =
      (
        await sdk
          .createSelfServiceLogoutFlowUrlForBrowsers(req.header("cookie"))
          .catch(() => ({ data: { logout_url: "" } }))
      ).data.logout_url || ""

    res.render("welcome", {
      layout: "welcome",
      nav: navigationMenu(session, logoutUrl),
      concepts: [
        Card({
          className: "welcome-card",
          heading: "Getting Started",
          children:
            "Jump start your project and complete the quickstart tutorial to get a broader overview of Ory Cloud.",
        }),
        Card({
          heading: "User flows",
          children:
            "Implement flows that users perform themselves as opposed to administrative intervention.",
        }),
        Card({
          heading: "Identities 101",
          children:
            "Every identity can have its own model - get to know the ins and outs of Identity Schemas.",
        }),
        Card({
          heading: "Sessions",
          children:
            "Define Text here Jump start your project and complete the quickstart tutorial to get a broader",
        }),
        Card({
          heading: "Custom UI",
          children:
            "Implementing these pages in your language and framework of choice is straightforward using our SDKs.",
        }),
      ].join("\n"),
    })
  }

export const registerWelcomeRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
  route = "/welcome",
) => {
  app.get(route, setSession(createHelpers), createWelcomeRoute(createHelpers))
}
