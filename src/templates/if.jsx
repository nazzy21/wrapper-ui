import React from "react";
import _ from "../utils";
import Template from "../template";

export default class If extends Template {
	validate() {
		const props = this.props,
			hasProperty = prop => _.contains(Object.keys(props), prop);

		if (!hasProperty("context")) {
			return false;
		}

		const context = props.context;

		if (hasProperty("is")) {
			return context === props.is;
		}

		if (hasProperty("isNot")) {
			return context !== props.isNot;
		}

		if (hasProperty("$lt")) {
			return parseInt(context) < parseInt(props.$lt);
		}

		if (hasProperty("$lte")) {
			return parseInt(context) <= parseInt(props.$lte);
		}

		if (hasProperty("$gt")) {
			return parseInt(context) > parseInt(props.$gt);
		}

		if (hasProperty("$gte")) {
			return parseInt(context) >= parseInt(props.$gte);
		}

		if (hasProperty("in")) {
			const _in = props.in.split(",").map(e => e.trim());

			return _.contains(_in, context);
		}

		if (hasProperty("notIn")) {
			const notIn = props.notIn.split(",").map(e => e.trim());

			return !_.contains(notIn, context);
		}

		if ("null" === context || _.isNull(context) || _.isUndefined(context)) {
			return false;
		}

		return !!context;
	}

	getContext({name, children}) {
		if (this.props.context !== name) {
			return null;
		}

		return children;
	} 

	hasError() {
		return super.hasError() || !this.validate();
	}
}