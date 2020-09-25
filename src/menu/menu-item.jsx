import React from "react";
import Template from "../template";
import Screen from "../screen";
import {isSameSite} from "../gql-state/config";

export default class MenuItem extends Template {
	/**
	 Constructor

	 @property {string} id
	 @property {string|object} label
	 @property {string} url
	 @property {function} onClick
	 @property {string} client
	 @property {boolean} selected
	**/
	constructor(props) {
		super(props);

		this.storage = this.props.storage;

		this.state.item = this.props.item;
		this.state.parentId = this.props.parentId;
		this.state.selected = this.isSelected();

		// Bind method for convernience
		this.onClick = this.onClick.bind(this);
		this.isSelected = this.isSelected.bind(this);
		this.__maybeSelected = this.__maybeSelected.bind(this);
		this.callback = this.uniqCallback(this.__maybeSelected, this.uniqId());

		// Listen to changes
		this.storage.subscribe(this.callback);
	}

	onClick(ev) {
		if (ev && ev.preventDefault) {
			ev.preventDefault();
		}

		const {id, url, client} = this.state.item;

		Screen.load(url, false, client);

		this.storage.setSync({selected: id||url});
	}

	isSelected() {
		const selected = this.storage.get("selected");

		return selected === this.state.item.id || selected === this.state.item.url;
	}

	getDataList() {
		const data = {};

		data.attr = this.getAttr();

		return data;
	}

	getAttr() {
		const item = this.state.item,
			attr = {};

		const _class = ["menu-item", `menu-item-${item.id}`];

		if (this.state.selected) {
			_class.push("current");
		}

		if (item.children) {
			_class.join("has-children");
		}

		attr.className = _class.join(" ");

		return attr;
	}

	getLink(child) {
		const {url, label, onClick, title, target} = this.state.item,
			props = {url, label, title, target};

		if (onClick) {
			props.onClick = onClick;
		} else if (isSameSite(url)) {
			props.onClick = this.onClick;
		}

		return React.cloneElement(child, props);
	}

	getSubMenu(child) {
		const item = this.state.item;

		if (!item.children) {
			return null;
		}

		const props = {
			items: item.children, 
			parentId: item.id||item.url,
			storage: this.storage
		};

		return React.cloneElement(child, props);
	}

	/**
	 @private
	 @callback
	**/
	__maybeSelected() {
		this.updateState({selected: this.isSelected()});
	}
}