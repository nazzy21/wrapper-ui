import React from "react";
import Template from "../template";
import _ from "../utils";
import TextInput from "./text";
import SelectInput from "./select";
import CheckInput from "./checkbox";
import CheckListInput from "./checklist";
import Textarea from "./textarea";
import UploadInput from "./upload";

class InputError extends Template {
	constructor(props) {
		super(props);

		this.state.message = this.props.message;
	}

	set(message) {
		this.updateState({message});
	}

	getDataList() {
		const data = {};

		data.message = this.state.message;

		return data;
	}

	hasError() {
		return super.hasError() || !this.state.message;
	}
}
InputError.defaultProps = {templateId: "/template/input/error"};

export default class InputField extends Template {
	/**
	 Constructor

	 @property {string} className
	 @property {string} name
	 @property {string} value
	 @property {string} type
	 @property {function} validate
	 @property {string} label
	 @property {string} pre
	 @property {string} desc
	**/
	constructor(props) {
		super(props);
	}

	setError(error) {
		if (!this.errorRef) {
			return;
		}

		this.errorRef.set(error);
	}

	getInput(child) {
		const props = _.clone(child.props),
			inputProps = _.omit(_.clone(this.props), ["validate", "pre", "desc", "label", "templateId", "dataList", "children"]);

		_.extend(props, inputProps);

		props.ref = ref => {this.inputRef = ref};

		// Clear error on change
		props.onChange = (val, input) => this.__maybeClearError(val, input, child.props.onChange || this.props.onChange );

		switch(this.props.type) {
			default : // Default is of type text

				return (<TextInput {...props}/>);

			case "checkbox" :
				return (<CheckInput {...props}/>);

			case "checklist" :
				return (<CheckList {...props}/>);

			case "select" :
				return (<SelectInput {...props}/>);

			case "textarea" :
				return (<Textarea {...props}/>);

			case "upload" :
				return (<UploadInput {...props}/>);
		}

		return null;
	}

	getInputError(child) {
		const props = _.clone(child.props);

		props.ref = ref => {this.errorRef = ref};

		return (<InputError {...props}/>);
	}

	getDataList() {
		const {type = "text", label, pre, desc} = this.props,
			data = {type, label, pre, desc};

		return data;
	}

	getValue() {
		if (!this.inputRef) {
			return null;
		}

		return this.inputRef.getValue();
	}

	/**
	 @private
	 @callback
	**/
	__maybeClearError(val, input, onChange) {
		if (this.errorRef && this.errorRef.state.message) {
			this.errorRef.set("");
		}

		if (onChange && _.isFunction(onChange)) {
			onChange.call(null, val, input);
		}
	}
}
InputField.defaultProps = {templateId: "/template/input/field"};