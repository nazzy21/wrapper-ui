import React from "react";
import Template from "../template";
import State from "../state";
import _ from "../utils";

/**
 @property {string} name
 @property {*} value
 @property {callback} onChange
**/
export default class TextInput extends Template {
	constructor(props) {
		super(props);

		const {name, value, subscribers = []} = this.props;

		this.store = new State("InputText", {name, value}, subscribers);

		// Bind listeners
		this.onChange = this.onChange.bind(this);
		this.getValue = this.getValue.bind(this);

		this.state = {error: null, errorMessage: null};
	}

	onChange(ev) {
		let value = ev.target.value;

		this.store.setSync({value});
	}

	onBlur() {
		if (!this.props.onChange) {
			return;
		}

		const value = this.store.get("value");

		this.props.onChange.call(null, value, this);
	}

	getAttr() {
		let {name, value} = this.store.get(),
			attr = _.pick(this.props, ["type", "id", "role", "title", "required", "readonly", "placeholder", "onKeyUp", "onKeyDown", "className"]);

		attr.name = name;
		attr.defaultValue = value;

		attr.onChange = this.onChange.bind(this);
		attr.onBlur = this.onBlur.bind(this);

		return attr;
	}

	getValue() {
		return this.store.get("value");
	}

	getDataList() {
		const attr = this.getAttr();

		if (!attr.type) {
			attr.type = "text";
		}

		return {attr};
	}
}
TextInput.defaultProps = {templateId: "/template/input/text"};