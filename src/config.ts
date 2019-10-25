export default {
  hive: {
    browser: (
      process.env.HIVE_BROWSER_URL ||
      process.env.HIVE_PUBLIC_URL ||
      ''
    ).replace(/\/+$/, ''),
    public: (process.env.HIVE_PUBLIC_URL || '').replace(/\/+$/, ''),
  },
  baseUrl: (process.env.BASE_URL || '/').replace(/\/+$/, '') + '/',
  jwksUrl: process.env.JWKS_URL || '/',
}
