import { ui } from '@ory/integrations'
import { UiNode } from '@ory/kratos-client'

// This helper function translates the html input type to the corresponding partial name.
export const toUiNodePartial = (node: UiNode) => {
  if (ui.isUiNodeAnchorAttributes(node.attributes)) {
    return 'ui_node_input_default'
  } else if (ui.isUiNodeImageAttributes(node.attributes)) {
    return 'ui_node_image'
  } else if (ui.isUiNodeInputAttributes(node.attributes)) {
    switch (node.attributes.type) {
      case 'hidden':
        return 'ui_node_input_hidden'
      case 'submit':
        return 'ui_node_input_button'
      case 'button':
        return 'ui_node_input_button'
      case 'checkbox':
        return 'ui_node_input_checkbox'
      default:
        return 'ui_node_input_default'
    }
  } else if (node.type === 'script') {
    return 'ui_node_script'
  } else if (ui.isUiNodeTextAttributes(node.attributes)) {
    return 'ui_node_text'
  }

  return 'ui_node_input_default'
}
