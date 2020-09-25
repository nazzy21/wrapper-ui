import React from "react";
import _ from "../utils";
import Template from "../template";
import State from "../state";
import Button from "./button";
import TextInput from "./text";
import SelectInput from "./select";
import CheckInput from "./checkbox";
import CheckListInput from "./checklist";
import Textarea from "./textarea";
import UploadInput from "./upload";
import InputField from "./field";

/**
 @property {string} type
 @property {string} className
 @property {string} id
 @property {string} method
 @property {array} subscribers
**/
export default class Form extends Template {
	constructor(props) {
		super(props);

		this.store = new State(this.props.type||"form", {}, this.props.subscribers||[]);
		this.inputs = new State("inputs");
		this.validators = new State("validators");

		// Bind methods for convenience
		this.onSubmit = this.onSubmit.bind(this);
	}

	onSubmit(ev) {
		if (ev && ev.preventDefault) {
			ev.preventDefault();
		}

		const validators = this.validators.get();

		let errors = 0;
		for(const key of _.keys(validators)) {
			const validate = validators[key],
				input = this.inputs.get(key);

			const valid = validate.call(null, input.getValue(), input);

			if (!valid) {
				errors++;
			}
		}

		return errors;
	}

	getAttr() {
		const {className, id, method} = this.props,
			attr = {className, id, method};

		attr.onSubmit = this.onSubmit.bind(this);

		return attr;
	}

	getDataList() {
		const data = {};

		// Get form attributes
		data.attr = this.getAttr();
		data.onSubmit = this.onSubmit;

		return data;
	}

	getButton(child) {
		const props = _.clone(child.props);

		return (<Button {...props}/>);
	}

	getTextInput(child) {
		return this.__getInput(<TextInput/>, _.clone(child.props));
	}

	getSelectInput(child) {
		return this.__getInput(<SelectInput/>, _.clone(child.props));
	}

	getCheckInput(child) {
		return this.__getInput(<CheckInput/>, _.clone(child.props));
	}

	getCheckListInput(child) {
		return this.__getInput(<CheckListInput/>, _.clone(child.props));
	}

	getTextarea(child) {
		return this.__getInput(<Textearea/>, _.clone(child.props));
	}

	getUploadInput(child) {
		return this.__getInput(<UploadInput/>, _.clone(child.props));
	}

	getInputField(child) {
		return this.__getInput(<InputField/>, _.clone(child.props));
	}

	/**
	 @private
	**/
	__getInput(child, otherProps = {}) {
		const props = _.clone(child.props);

		// Merge additional properties
		_.extend(props, otherProps);

		if (!child.key) {
			props.key = this.uniqId();
		}

		// Store the input
		const {name, value} = props,
			values = this.store.get();

		if (!_.contains(_.keys(values), name)) {
			this.store.set(name, value);
		} else {
			props.value = this.store.get(name);
		}

		if (props.validate) {
			this.validators.set(name, props.validate);
		}

		props.ref = ref => this.inputs.set(name, ref);
		props.subscribers = [this.__updateInputValue.bind(this)];

		return React.cloneElement(child, props);
	}

	__updateInputValue({name, value}) {
		this.store.set(name, value);
	}
}

export {TextInput, CheckInput, CheckListInput, Textarea, InputField, UploadInput, SelectInput};