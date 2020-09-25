import React from "react";
import CheckInput from "./checkbox";

/**
 @property {array<object>} options
 	The list of selections to set;
 	{
		@property {*} value
		@property {string} label
 	}
**/
export default class SelectInput extends CheckInput {
	getDataList() {
		const attr = this.getAttr(),
			options = this.props.options;

		return {attr, options};
	}
}
SelectInput.defaultProps = {templateId: "/input/select"};