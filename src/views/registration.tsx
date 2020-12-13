import MainLayout from './layouts/main'
import AuthForm from './partials/form'
import IconLogo from './partials/icon_logo'

const RegistrationPage = props => {
  const { oidc, password, pathPrefix } = props

  return (
    <MainLayout {...props}>
      <div className="auth">
        <div className="container">
          <IconLogo />
          <h5 className="subheading">
            Welcome to SecureApp! <br />
            Use the form below to sign up:
          </h5>

          {password && (
            <div id="registration-password">
              <AuthForm {...password} submitLabel="Sign up" />
            </div>
          )}

          {oidc && (
            <div id="registration-oidc">
              <AuthForm {...oidc} />
            </div>
          )}

          <hr className="divider" />

          <div className="alternative-actions">
            <a href={`${pathPrefix}auth/login`}>
              Already have an account? Log in instead
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default RegistrationPage
