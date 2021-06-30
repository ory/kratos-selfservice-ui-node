import { UiNode, UiNodeInputAttributes } from '@ory/kratos-client'
import {
  UiNodeAnchorAttributes,
  UiNodeTextAttributes,
} from '@ory/kratos-client/api'

const ui: { [key: string]: { title: string } } = {
  // You could add custom translations here if you want to:
  //
  // 'traits.email': {
  //   title: 'E-Mail',
  // },
}

type Translations = typeof ui

export const onlyNodes = (nodes: Array<UiNode>, only?: string) => {
  if (!only) {
    return nodes
  }
  return nodes.filter(({ group }) => group === only)
}

export const getTitle = (n: UiNode): string => {
  switch (n.type) {
    case 'a':
      return (n.attributes as UiNodeAnchorAttributes).title.text
    case 'img':
      return n.meta.label?.text || ''
    case 'input':
      const key = (n.attributes as UiNodeInputAttributes).name
      if (n.meta?.label?.text) {
        return n.meta.label.text
      } else if (key in ui) {
        return ui[key as keyof Translations].title
      }
      return key
    case 'text':
      return (n.attributes as UiNodeTextAttributes).text.text
  }

  return ''
}

// This helper function translates the html input type to the corresponding partial name.
export const toUiNodePartial = (node: UiNode) => {
  switch (node.type) {
    case 'input': {
      const attributes = node.attributes as UiNodeInputAttributes
      switch (attributes.type) {
        case 'hidden':
          return 'ui_node_input_hidden'
        case 'password':
          return 'ui_node_input_password'
        case 'submit':
          return 'ui_node_input_button'
        case 'checkbox':
          return 'ui_node_input_checkbox'
        default:
          return 'ui_node_input_default'
      }
    }
  }
  return 'ui_node_input_default'
}
