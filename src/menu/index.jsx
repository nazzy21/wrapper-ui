import React from "react";
import Template from "../template";
import State from "../state";

export default class Menu extends Template {
	/**
	 Constructor

	 @property {array<Object>} items
	 	[{
			@property {string} id
			@property {string|object} label
			@property {string} url
			@property {string} client
			@property {function} onClick
	 	}]
	 @property {string} id
	 @property {string} className
	 @property {string} selected
	 	The id or url of currently selected menu item.
	**/
	constructor(props) {
		super(props);

		this.state.items = this.props.items;

		this.storage = new State(this.props.id, {selected: this.props.selected});
	}

	getMenuItem(child) {
		const items = [];

		for(const item of this.state.items) {
			const props = {item};

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
}
Menu.defaultProps = {templateId: "/template/menu"};