import React from "react";
import Template from "../template";
import _ from "../utils";
import {isValidUrl} from "../gql-state/config";
import Screen from "../screen";

export default class SubMenu extends Template {
	/**
	 Constructor

	 @property {array<Object>} items
	 @property {string} parentId
	**/
	constructor(props) {
		super(props);

		this.storage = this.props.storage;
		this.state.items = this.props.items;
		this.state.parentId = this.props.parentId;
		this.state.selected = this.isSelected();

		// Listen to selection change
		this.__maybeSelected = this.__maybeSelected.bind(this);
		this.callback = this.uniqCallback(this.__maybeSelected, this.uniqId());

		this.storage.subscribe(this.callback);
	}

	isSelected() {
		const selected = this.storage.get("selected");

		return selected === this.state.parentId;
	}

	getMenuItem(child) {
		const items = [];

		for(const item of this.state.items) {
			const props = {item};

			props.parentId = this.state.parentId;
			props.key = this.uniqId();
			props.storage = this.storage;

			items.push(React.cloneElement(child, props));
		}

		return items;
	}

	hasError() {
		return super.hasError() ||
			!this.state.items || !this.state.items.length;
	}

	/**
	 @private
	 @callback
	**/
	__maybeSelected() {
		this.updateState({selected: this.isSelected()});
	}
}