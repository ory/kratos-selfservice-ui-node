export default {
  kratos: {
    browser: (process.env.KRATOS_BROWSER_URL || '').replace(/\/+$/, ''),
    admin: (process.env.KRATOS_ADMIN_URL || '').replace(/\/+$/, ''),
    public: (process.env.KRATOS_PUBLIC_URL || '').replace(/\/+$/, ''),
  },
  baseUrl: (process.env.BASE_URL || '/').replace(/\/+$/, '') + '/',
  jwksUrl: process.env.JWKS_URL || '/',
  projectName: process.env.PROJECT_NAME || 'SecureApp',
}
