import React from "react";
import TextInput from "./text";

/**
 @property {string} name
 @property {string} value
 @property {callback} onChange
**/
export default class Textearea extends TextInput {
	getDataList() {
		return {attr: this.getAttr()};
	}
}
Textearea.defaultProps = {templateId: "/template/input/textarea"};