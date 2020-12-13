import Messages from './messages'
import FormFields from './form_fields'

const AuthForm = ({ action, method, messages, fields, submitLabel }) => {
  return (
    <form action={action} method={method}>
      <Messages messages={messages} />
      <FormFields fields={fields} />
      {submitLabel && <button type="submit">{submitLabel}</button>}
    </form>
  )
}

export default AuthForm
