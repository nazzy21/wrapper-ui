import React from "react";
import Template from "../template";
import _ from "../utils";
import {isSameSite} from "../gql-state/config";
import Screen from "../screen";

/**
 @property {string} label
 @property {string} url
 @property {function} onClick
 @property {string} client
**/
export default class Link extends Template {
	constructor(props) {
		super(props);
	}

	onClick(ev) {
		if (ev && ev.preventDefault) {
			ev.preventDefault();
		}

		const url = this.props.url;

		Screen.load(url, false, this.props.client);
	}

	getAttr() {
		let attr = _.pick(this.props, ["id", "role", "className", "title", "target"]);

		// Add url
		attr.href = this.props.url;

		if (this.props.onClick) {
			attr.onClick = this.props.onClick;
		} else if (isSameSite(this.props.url)) {
			attr.onClick = this.onClick.bind(this);
		}

		return attr;
	}

	getDataList() {
		return {
			attr: this.getAttr(),
			label: this.props.label
		};
	}
}
Link.defaultProps = {templateId: "/template/link"};