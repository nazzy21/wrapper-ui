import React from "react";
import Template from "../template";
import Screen from "../screen";

/**
 Displays the screen header.

 @property {string} slug
 	The unique slug to identify a unique header. If omitted, will display the default
 	screen header.
**/
export default class Header extends Template {
	render() {
		if (this.hasError()) {
			return null;
		}

		// Template children takes precedence when it comes to templating
		if (this.props.children) {
			return this.iterateChildren(this.props.children, {});
		}

		const templateId = this.props.slug ? `/header-${slug}` : '/header',
			template = Screen.getTemplate(templateId, "/header");

		return this.iterateChildren(template, {});
	}
}