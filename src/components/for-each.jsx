import React from "react";
import Template from "../template";
import {isArray} from "../utils";

export default function ForEach({context, children}) {
	if (!context || isArray(context)) {
		return null;
	}

	const items = [];

	for(const item of context) {
		items.push(<Template dataList={item} key={this.uniqId()}>{children}</Template>);
	}

	return items;
}