import React from "react";
import Template from "../template";
import TextInput from "./text";
import Icon from "../components/icon";

/**
 @property {string} name
 @property {*} value
 @property {boolean} selected
 	Whether the box is selected on first load.
 @property {callback} onChange
 	A function to execute when selection change.
 @property {array<function>} subscribers
**/
export default class CheckInput extends TextInput {
	constructor(props) {
		super(props);

		const {name, value, subscribers = [], selected} = this.props;

		this.store = new State("CheckInput", {name, value, selected}, subscribers);
		this.state = {selected};

		this.store.subscribe(this.updateState);

		// Bind listeners
		this.onChange = this.onChange.bind(this);
	}

	onChange() {
		const selected = !this.state.selected;
		
		this.store.update({selected});

		if (this.props.onChange) {
			this.props.onChange.call(null, selected, text, this);
		}
	}

	getAttr() {
		const attr = super.getAttr();

		// Remove blur event
		delete attr.onBlur;

		return attr;
	}

	getDataList() {
		let attr = this.getAttr();

		attr.type = "checkbox";

		return {
			attr, 
			label: this.props.label,
			selected: this.state.selected,
			id: attr.id||this.uniqId()
		};
	}
}
CheckInput.defaultProps = {templateId: "/input/check"};