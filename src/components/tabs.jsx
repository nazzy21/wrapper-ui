import React from "react";
import Template from "../template";

/**
 @property {string} type
 @property {object} items
 @property {string} current
**/
export default class Tabs extends Template {
	constructor(props) {
		super(props);

		this.state.current = this.props.current;
	}

	switchTab(ev, tabId) {
		this.updateState({current: tabId});
	}

	getTabItem(child) {
		const props = {
			onClick: ev => switchTab(ev, child.props.id)
		};

		return this.iterateChildren(child.props.children, props);
	}

	getTabContent(child) {
		const id = child.props.id;

		if (id !== this.state.current) {
			return null;
		}

		return child.props.children;
	}
}