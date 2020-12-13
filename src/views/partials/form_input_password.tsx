import Messages from './messages'

const FormInputPassword = props => {
  return (
    <fieldset>
      <label>
        <input
          name={props.name}
          type={props.type}
          value={props.value}
          placeholder={props.name}
        />
      </label>
      <Messages messages={props.messages} />
    </fieldset>
  )
}

export default FormInputPassword
