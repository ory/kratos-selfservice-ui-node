import FormInputHidden from './form_input_hidden'
import FormInputPassword from './form_input_password'
import FormFieldButton from './form_field_button'
import FormInputDefault from './form_input_default'

const toFormInputPartialName = field => {
  switch (field.type) {
    case 'hidden':
      return <FormInputHidden {...field} />
    case 'password':
      return <FormInputPassword {...field} />
    case 'submit':
      return <FormFieldButton {...field} />
    default:
      return <FormInputDefault {...field} />
  }
}

const FormFields = ({ fields }) => {
  return fields.map(field => toFormInputPartialName(field))
}

export default FormFields
