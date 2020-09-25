import React from "react";
import Template from "../template";
import Screen from "../screen";

/**
 Displays the screen footer.

 @property {string} slug
 	The unique slug to identify a unique footer. If omitted, will display the default
 	screen footer.
**/
export default class Footer extends Template {
	render() {
		if (this.hasError()) {
			return null;
		}

		// Template children takes precedence when it comes to templating
		if (this.props.children) {
			return this.iterateChildren(this.props.children, {});
		}

		const templateId = this.props.slug ? `/footer-${slug}` : '/footer',
			template = Screen.getTemplate(templateId, "/footer");

		return this.iterateChildren(template, {});
	}
}