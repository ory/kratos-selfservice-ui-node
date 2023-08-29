import { UiNode, Session } from "@ory/client";
export declare const toUiNodePartial: (node: UiNode) => "ui_node_anchor" | "ui_node_image" | "ui_node_input_hidden" | "ui_node_input_social_button" | "ui_node_input_button" | "ui_node_input_checkbox" | "ui_node_input_default" | "ui_node_script" | "ui_node_text";
type NavigationMenuProps = {
    navTitle: string;
    session?: Session;
    logoutUrl?: string;
    selectedLink?: "welcome" | "sessions";
};
/**
 * Renders the navigation bar with state
 * @param session
 * @param logoutUrl
 * @returns
 */
export declare const navigationMenu: ({ navTitle, session, logoutUrl, selectedLink, }: NavigationMenuProps) => string | null;
export {};
