import { getTitle } from '../../translations'
import Messages from './messages'

const FormInputDefault = props => {
  return (
    <fieldset>
      <label>
        <input
          name={props.name}
          type={props.type}
          value={props.value}
          placeholder={getTitle(props.name)}
          disabled={props.disabled}
        />
        <span>{getTitle(props.name)}</span>
      </label>
      <Messages {...props} />
    </fieldset>
  )
}

export default FormInputDefault
