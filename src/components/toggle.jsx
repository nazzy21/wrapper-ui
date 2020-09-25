import React from "react";
import Template from "../template";

/**
 @property {boolean} multiple
 @property {string|boolean} current
 	The content's id to first appear or a boolean to show the content on first load.
**/
export default class Toggle extends Template {
	constructor(props) {
		super(props);

		const {current} = this.props;

		this.state = {current};
	}

	isMultiple() {
		return !!this.props.multiple;
	}

	switchCurrent(current) {
		if (this.isMultiple()) {
			this.updateState({current});

			return;
		}
		
		this.updateState({current: !this.state.current});
	}

	getToggleContent(child) {
		const id = child.props.id;

		if (!this.state.current || this.state.current !== id) {
			return null;
		}

		return child.props.children;
	}

	getDataList() {
		const dataList = {
			current: this.state.current,
			toggle: child => this.switchCurrent(child.props.target)
		};

		return dataList;
	}
}