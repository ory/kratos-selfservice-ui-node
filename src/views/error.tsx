import MainLayout from './layouts/main'
import AuthHeader from './partials/header'

const AuthErrorPage = props => {
  return (
    <MainLayout {...props}>
      <div className="content">
        <AuthHeader {...props} />
        <div className="container">
          <h1>An error occurred</h1>
          <pre>
            <code>{props.message}</code>
          </pre>
        </div>
      </div>
    </MainLayout>
  )
}

export default AuthErrorPage
