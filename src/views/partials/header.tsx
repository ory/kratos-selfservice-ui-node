import IconLogo from './icon_logo'
import IconGear from './icon_gear'
import IconSignOut from './icon_sign_out'
import IconRepoForked from './icon_repo_forked'

export const AuthHeader = props => {
  return (
    <div className="header">
      <a href={props.pathPrefix}>
        <IconLogo />
      </a>
      <div className="icon-actions">
        <div className="settings">
          <a href={`${props.pathPrefix}settings`}>
            <IconGear />
          </a>
        </div>
        <div className="logout">
          <a href={props.logoutUrl}>
            <IconSignOut />
          </a>
        </div>
        <div className="fork">
          <a
            href="https://github.com/ory/kratos-selfservice-ui-node"
            target="_blank"
          >
            <IconRepoForked />
            <div>
              Fork on
              <br />
              GitHub
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default AuthHeader
