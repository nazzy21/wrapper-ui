import React from "react";
import {parseDOM} from "htmlparser2";
import Text from "./text";
import {hasComponent, renderComponent} from "../component";
import _ from "../utils";
import parseAttr from "./attr";

export default function parseHTML(html) {
	if (_.isObject(html) && React.isValidElement(html)) {
		return html;
	}
	
	const nodes = parseDOM(html, {
		lowerCaseTags: false,
		lowerCaseAttributeNames: false,
		recognizeSelfClosing: true,
		decodeEntities: true
	});

	return nodes.map(parseNode);
}

let pos = 0;

function parseNode(node) {
	pos++;

	const key = `n_${pos}`;

	switch(node.type) {
		case "comment" :
		case "script" :
		case "style" :
		case "link" :
			return null;
		case "text" :
			let text = node.data;

			if (!text) {
				return null;
			}

			text = text.replace(/\n|\r\t/g, "");

			if (!text) {
				return null;
			}

			return <Text key={key} text={node.data}/>;

		case "tag" :
			let children = null;

			if (!_.isEmpty(node.children)) {
				children = node.children.map(parseNode);
			}

			const attr = parseAttr(node.attribs);
			attr.key = key;

			if (hasComponent(node.name)) {
				return renderComponent(node.name, attr, children);
			}

			return React.createElement(node.name, attr, children);
	}

	return null;
}