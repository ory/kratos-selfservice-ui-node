// Copyright © 2022 Ory Corp
// SPDX-License-Identifier: Apache-2.0
import {
  RouteCreator,
  RouteRegistrator,
  defaultConfig,
  isQuerySet,
} from "../pkg"
import { FlowError, FrontendApi, GenericError } from "@ory/client"
import { UserErrorCard } from "@ory/elements-markup"
import { isAxiosError } from "axios"

type OAuth2Error = {
  error: string
  error_description?: string
  error_hint?: string
}

function isOAuth2Error(query: qs.ParsedQs): query is OAuth2Error {
  return query.error !== undefined
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
        status: "OAuth2 Error",
        id: decodeURIComponent(query.error.toString()),
        message: decodeURIComponent(
          query.error_description?.toString() || "No description provided",
        ),
        ...(query.error_hint
          ? { hint: decodeURIComponent(query.error_hint.toString()) }
          : {}),
        code: 599, // Dummy code to trigger the full error screen
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
          backUrl: req.header("Referer") || "welcome",
        }),
      })
    } catch (err) {
      let error: FlowError
      if (isAxiosError(err)) {
        error = err.response?.data.error
      } else {
        error = {
          id: "Failed to fetch error details",
          error: err as GenericError,
        }
      }

      res.status(200).render("error", {
        card: UserErrorCard({
          error: {
            id: "Failed to fetch error details",
            error: {
              ...error,
              code: 500,
            },
          },
          cardImage: logoUrl,
          title: "An error occurred",
          backUrl: req.header("Referer") || "welcome",
        }),
      })
      return
    }
  }

export const registerErrorRoute: RouteRegistrator = (
  app,
  createHelpers = defaultConfig,
) => {
  app.get("/error", createErrorRoute(createHelpers))
}
