import MainLayout from './layouts/main'
import Messages from './partials/messages'
import IconLogo from './partials/icon_logo'
import AuthForm from './partials/form'

const LoginPage = props => {
  const { messages, password, oidc, pathPrefix } = props

  return (
    <MainLayout {...props}>
      <div className="auth">
        <div className="container">
          <IconLogo />
          <h5 className="subheading">Welcome to this example login screen!</h5>
          <Messages messages={messages} className="global" />

          {password && (
            <div id="login-password">
              <AuthForm {...password} submitLabel="Sign in" />
            </div>
          )}

          {oidc && (
            <div id="login-oidc">
              <AuthForm {...oidc} />
            </div>
          )}

          <hr className="divider" />

          <div className="alternative-actions">
            <a href={`${pathPrefix}auth/registration`}>Register new account</a>
            <a href={`${pathPrefix}recovery`}>Reset password</a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default LoginPage
