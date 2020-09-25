import React from "react";
import Template from "../template";
import State from "../state";
import _ from "../utils";
import CheckInput from "./checkbox";

/**
 @property {string} name
 @property {*} value
 @property {boolean} multiple
 @property {array<object<{value, label}>>} options
**/
export default class CheckListInput extends Template {
	constructor(props) {
		super(props);

		let {name, value, subscribers = []} = this.props;

		this.store = new State("CheckListInput", {name, value}, subscribers);

		if (this.props.onChange) {
			this.store.subscribe(this.props.onChange);
		}

		// Bind listener
		this.selectionChanged = this.selectionChanged.bind(this);
	}

	selectionChanged(isSelected, value) {
		let currentValue = this.store.get("value");

		if (!this.props.multiple) {
			this.store.set({value: isSelected ? null : value});

			return;
		}

		currentValue = _.isArray(currentValue) ? currentValue : [currentValue];

		if (selected) {
			currentValue.push(value);
		} else {
			currentValue = _.without(currentValue, value);
		}

		this.store.set({value: currentValue});
	}

	getOptions() {
		const items = [],
			currentValue = this.store.get("value");

		for(const {value, label} of this.props.options) {
			let selected = false;

			if (currentValue && _.isArray(currentValue) && _.contains(currentValue, value)) {
				selected = true;
			} else if (currentValue && _.isEqual(currentValue, value)) {
				selected = true;
			}

			items.push({
				attr: {name, value, selected, label, onChange: this.selectionChanged},
				selected
			});
		}

		return items;
	}

	getDataList() {
		return {items: this.getOptions()};
	}
}
CheckListInput.defaultProps = {templateId: "/input/checklist"};