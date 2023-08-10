// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import { FlowError, FrontendApi } from "@ory/client"
import { UserErrorCard } from "@ory/elements-markup"
import {
  RouteCreator,
  RouteRegistrator,
  defaultConfig,
  isQuerySet,
} from "../pkg"

type OAuth2Error = {
  error: string
  error_description: string
}

function isOAuth2Error(query: qs.ParsedQs): query is OAuth2Error {
  return query.error !== undefined && query.error_description !== undefined
}

/**
 * Returns an error object, either from Ory Identities or an OAuth2 error.
 *
 * @param frontend the frontend SDK
 * @param query the query parameters as received from the request
 * @returns a FlowError object
 */
async function fetchError(
  frontend: FrontendApi,
  query: qs.ParsedQs,
): Promise<FlowError> {
  // If the error is an OAuth2 error, its details are encoded into the URL.
  // We can simply decode them and return them here.
  if (isOAuth2Error(query)) {
    return {
      id: decodeURIComponent(query.error.toString()),
      error: {
        id: decodeURIComponent(query.error.toString()),
        message: decodeURIComponent(query.error_description.toString()),
        status: "OAuth2 Error",
        code: 599,
      },
    }
  } else if (isQuerySet(query.id)) {
    // If the error comes from Ory Identities/Kratos, we need to fetch its details from the backend.
    // Once that's done, we can return the error.
    const res = await frontend.getFlowError({ id: query.id })

    if (res.status !== 200) {
      throw new Error("No error was found")
    }

    return res.data
  }

  throw new Error("No error was found")
}

// A simple express handler that shows the error screen.
export const createErrorRoute: RouteCreator =
  (createHelpers) => async (req, res) => {
    res.locals.projectName = "An error occurred"

    // Get the SDK
    const { frontend, logoUrl } = createHelpers(req, res)

    try {
      const error = await fetchError(frontend, req.query)

      res.status(200).render("error", {
        card: UserErrorCard({
          error,
          cardImage: logoUrl,
          title: "An error occurred",
          backUrl: req.header("Referer") || "welcome",
        }),
      })
    } catch (err) {
      // The error could not be found or there was an error fetching it, redirect back to home.
      res.redirect("welcome")
      return
    }
  }

export const registerErrorRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get("/error", createErrorRoute(createHelpers))
}
