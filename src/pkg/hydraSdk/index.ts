import { AdminApi, Configuration } from '@ory/hydra-client'

const baseOptions: any = {}
baseOptions.headers = { 'X-Forwarded-Proto': 'https' }

console.log(`Using hydra admin api: ${process.env.HYDRA_ADMIN_URL}`)

export const hydraAdmin = new AdminApi(
  new Configuration({
    basePath: process.env.HYDRA_ADMIN_URL,
    baseOptions
  })
)
