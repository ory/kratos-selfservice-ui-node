import MainLayout from './layouts/main'
import AuthHeader from './partials/header'
import Messages from './partials/messages'
import AuthForm from './partials/form'

const SettingsPage = props => {
  return (
    <MainLayout {...props}>
      <div className="content">
        <AuthHeader {...props} />
        <div className="container">
          <h2>Settings</h2>
          <Messages messages={props.messages} className="global" />
          {props.state === 'success' && <p>Your changes have been saved!</p>}
          {props.profile && (
            <div id="user-profile">
              <h3>Profile</h3>
              <AuthForm {...props.profile} submitLabel="Save" />
            </div>
          )}
          {props.password && (
            <>
              <hr />
              <div id="user-password">
                <h3>Password</h3>
                <AuthForm {...props.password} submitLabel="Save" />
              </div>
            </>
          )}
          {props.oidc && (
            <>
              <hr />
              <div id="user-oidc">
                <h3>Social Sign In</h3>
                <AuthForm {...props.oidc} />
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default SettingsPage
