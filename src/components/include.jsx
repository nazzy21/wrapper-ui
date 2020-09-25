import React from "react";
import Template from "../template";
import {getTemplate} from "../config";

/**
 Includes template from a different location.
 	The template to include must be not one of the primary templates.

 @param {string} path
*/
export default class Include extends Template {
	hasError() {
		return super.hasError() || !this.props.path
	}

	render() {
		if (this.hasError()) {
			return null;
		}

		const template = getTemplate(this.props.path);

		return template??null;
	}
}