import { UiNode } from "@ory/client"
import {
  isUiNodeAnchorAttributes,
  isUiNodeImageAttributes,
  isUiNodeInputAttributes,
  isUiNodeScriptAttributes,
  isUiNodeTextAttributes,
} from "@ory/integrations/ui"

// This helper function translates the html input type to the corresponding partial name.
export const toUiNodePartial = (node: UiNode) => {
  if (isUiNodeAnchorAttributes(node.attributes)) {
    return "ui_node_anchor"
  } else if (isUiNodeImageAttributes(node.attributes)) {
    return "ui_node_image"
  } else if (isUiNodeInputAttributes(node.attributes)) {
    switch (node.attributes.type) {
      case "hidden":
        return "ui_node_input_hidden"
      case "submit":
        return "ui_node_input_button"
      case "button":
        return "ui_node_input_button"
      case "checkbox":
        return "ui_node_input_checkbox"
      default:
        return "ui_node_input_default"
    }
  } else if (isUiNodeScriptAttributes(node.attributes)) {
    return "ui_node_script"
  } else if (isUiNodeTextAttributes(node.attributes)) {
    return "ui_node_text"
  }

  return "ui_node_input_default"
}
