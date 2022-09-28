import { UiNodeInputAttributes } from "@ory/client"
import {
  Nav,
  UserSettingsCard,
  ErrorMessages,
  UserSettingsFlowType,
  Divider,
} from "@ory/elements-markup"
import {
  filterNodesByGroups,
  isUiNodeInputAttributes,
} from "@ory/integrations/ui"
import {
  defaultConfig,
  getUrlForFlow,
  isQuerySet,
  logger,
  redirectOnSoftError,
  requireAuth,
  RouteCreator,
  RouteRegistrator,
} from "../pkg"

export const createSettingsRoute: RouteCreator =
  (createHelpers) => async (req, res, next) => {
    res.locals.projectName = "Account settings"

    const { flow, return_to = "" } = req.query
    const helpers = createHelpers(req)
    const { sdk, kratosBrowserUrl } = helpers
    const initFlowUrl = getUrlForFlow(
      kratosBrowserUrl,
      "settings",
      new URLSearchParams({ return_to: return_to.toString() }),
    )

    // The flow is used to identify the settings and registration flow and
    // return data like the csrf_token and so on.
    if (!isQuerySet(flow)) {
      logger.debug("No flow ID found in URL query initializing login flow", {
        query: req.query,
      })
      res.redirect(303, initFlowUrl)
      return
    }

    // Create a logout URL
    const logoutUrl =
      (
        await sdk
          .createSelfServiceLogoutFlowUrlForBrowsers(req.header("cookie"))
          .catch(() => ({ data: { logout_url: "" } }))
      ).data.logout_url || ""

    return sdk
      .getSelfServiceSettingsFlow(flow, undefined, req.header("cookie"))
      .then(({ data: flow }) => {
        // Render the data using a view (e.g. Jade Template):
        res.render("settings", {
          layout: "settings",
          nav: Nav({
            className: "main-nav",
            navTitle: "Project Name",
            navSections: [
              {
                links: [
                  {
                    name: "Profile",
                    href: "#profile",
                    iconLeft: "user",
                    testId: "profile",
                  },
                  {
                    name: "Password",
                    href: "#password",
                    iconLeft: "lock",
                    testId: "password",
                  },
                  {
                    name: "Social Sign In",
                    href: "#social-sign-in",
                    iconLeft: "comments",
                    testId: "social-sign-in",
                  },
                  {
                    name: "2FA Backup Codes",
                    href: "#backup-codes",
                    iconLeft: "shield",
                    testId: "backup-codes",
                  },
                  {
                    name: "Hardware Tokens",
                    href: "#webauthn",
                    iconLeft: "key",
                    testId: "webauthn",
                  },
                  {
                    name: "Authenticator App",
                    href: "#totp",
                    iconLeft: "mobile",
                    testId: "totp",
                  },
                ],
              },
              {
                links: [
                  {
                    name: "Logout",
                    href: logoutUrl,
                    iconLeft: "arrow-right-to-bracket",
                    testId: "logout",
                  },
                ],
              },
            ],
          }),
          nodes: flow.ui.nodes,
          errorMessages: ErrorMessages({
            nodes: filterNodesByGroups({
              nodes: flow.ui.nodes,
              groups: "default",
            }),
            uiMessages: flow.ui.messages,
          }),
          webAuthnHandler: filterNodesByGroups({
            nodes: flow.ui.nodes,
            groups: "webauthn",
            attributes: "button",
            withoutDefaultAttributes: true,
            withoutDefaultGroup: true,
          })
            .filter(({ attributes }) => isUiNodeInputAttributes(attributes))
            .map(({ attributes }) => {
              return (attributes as UiNodeInputAttributes).onclick
            })
            .filter((c) => c !== undefined),
          settingsCard: (flowType: string) => {
            const card = UserSettingsCard({
              flow,
              flowType: flowType as UserSettingsFlowType,
            })
            if (card) {
              return (
                `<div class="spacing-32" id="${flowType}">` +
                card +
                Divider({ className: "divider-left", fullWidth: false }) +
                `</div>`
              )
            }
            return ""
          },
        })
      })
      .catch(redirectOnSoftError(res, next, initFlowUrl))
  }

export const registerSettingsRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get(
    "/settings",
    requireAuth(createHelpers),
    createSettingsRoute(createHelpers),
  )
}
