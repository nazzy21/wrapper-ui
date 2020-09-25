import React from "react";
import Template from "../template";
import Config from "../gql-state/config";

/**
 @property {string} defaultSrc
 	The logo to display when there's no logo on the server configuration found.
 @property {string} className
 	The custom class to set into the template.
**/
export default class Logo extends Template {
	getDataList() {
		const data = {};

		data.homeUrl = "/";
		data.logoSrc = Config.get("logo") || this.props.defaultSrc;
		data.className = this.props.className;

		return data;
	}
}
Logo.defaultProps = {templateId: "/template/logo"};