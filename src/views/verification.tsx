import MainLayout from './layouts/main'
import AuthHeader from './partials/header'
import Messages from './partials/messages'
import AuthForm from './partials/form'

const AuthVerificationPage = props => {
  return (
    <MainLayout {...props}>
      <div className="content">
        <AuthHeader {...props} />
        <div className="container">
          <h4>Verify your email address</h4>
          <Messages messages={props.messages} className="global" />
          {props.state === 'passed_challenge' && (
            <p>Verification successful!</p>
          )}

          {props.link && (
            <div id="verification-token">
              <AuthForm
                {...props.link}
                submitLabel="Resend verification link"
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default AuthVerificationPage
