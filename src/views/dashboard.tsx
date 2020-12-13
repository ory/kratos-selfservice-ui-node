import MainLayout from './layouts/main'
import AuthHeader from './partials/header'
import { jsonPretty } from '../helpers'

const DashboardPage = props => {
  return (
    <MainLayout {...props}>
      <div className="content">
        <AuthHeader {...props} />
        <div className="container">
          <h2 className="greeting">
            Welcome back,{' '}
            <span className="user-identifier">
              {props.session.identity.traits.email}
            </span>
            !
          </h2>
          <h3>This example app is secure by default!</h3>
          <p>Hello, nice to have you! You signed up with this data:</p>
          <pre>
            <code>{jsonPretty(props.session.identity.traits)}</code>
          </pre>
          <p>
            Requests to your application contain a ORY Kratos Session Cookie:
          </p>
          <pre>
            <code>{jsonPretty(props.headers)}</code>
          </pre>

          <p>
            which a ExpressJS middleware checks for validity and payload. The
            decoded ORY Kratos Session payload is as follows:
          </p>
          <pre>
            <code>{jsonPretty(props.session)}</code>
          </pre>
        </div>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
