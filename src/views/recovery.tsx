import MainLayout from './layouts/main'
import AuthHeader from './partials/header'
import Messages from './partials/messages'
import AuthForm from './partials/form'

const RecoveryPage = props => {
  return (
    <MainLayout {...props}>
      <div className="content">
        <AuthHeader {...props} />
        <div className="container">
          <h4>Recover your account</h4>
          <Messages messages={props.messages} className="global" />
          {props.link && (
            <div id="recovery-token">
              <AuthForm {...props.link} submitLabel="Send recovery link" />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default RecoveryPage
