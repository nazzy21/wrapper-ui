import React from "react";
import {i18n} from "../lang";
import Template from "../template";

export default class Lang extends Template {
	render() {
		if (this.hasError()) {
			return null;
		}

		return i18n(this.props.text);
	}
}