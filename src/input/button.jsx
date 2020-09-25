import React from "react";
import Template from "../template";
import _ from "../utils";
import {getTemplate} from "../gql-state/config";

export default class Button extends Template {
	constructor(props) {
		super(props);

		const {type = "button", className, disabled, label} = this.props;

		this.state = {type, className, disabled, label};
	}

	enable() {
		this.updateState({disabled: false});
	}

	disable() {
		this.updateState({disabled: true});
	}

	getAttr() {
		let attr = _.pick(this.props, ["type", "className", "onClick", "onPress", "id", "disabled"]);

		return attr;
	}

	getDataList() {
		const attr = this.getAttr(),
			label = this.state.label || this.props.children;

		return {attr, label};
	}

	render() {
		if (this.hasError()) {
			return null;
		}

		const template = getTemplate(this.props.templateId);

		return this.iterateChildren(template, this.getDataList());
	}
}
Button.defaultProps = {templateId: "/template/input/button"};