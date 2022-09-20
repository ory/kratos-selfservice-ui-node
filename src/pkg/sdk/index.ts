import { Configuration, V0alpha2Api } from "@ory/client"

const apiBaseUrlInternal =
  process.env.KRATOS_PUBLIC_URL ||
  process.env.ORY_SDK_URL ||
  "https://playground.projects.oryapis.com"

export const apiBaseUrl = process.env.KRATOS_BROWSER_URL || apiBaseUrlInternal

// Sets up the SDK
let sdk = new V0alpha2Api(
  new Configuration({
    basePath: apiBaseUrlInternal,
    // accessToken: "Your Ory Cloud API Key / Personal Access Token"
  }),
)

export default sdk
