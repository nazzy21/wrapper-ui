import {GQLConfig, GQLQueryState} from "@wrapper/gql-client";
import UAParser from "ua-parser-js";
import parseHTML from "../parser";
import _ from "../utils";

class ConfigState extends GQLQueryState {
	constructor() {
		super({
			name: "getConfig",
			args: {
				clientId: {type: "String"},
				client: {type: "String!"},
				platform: {type: "Object"}
			},
			query: `getConfig(clientId: $clientId client: $client platform: $platform){
				sessionId
				templates
				settings
			}`
		});

		this.defaults = {};

		// Bind methods for convenience
		this.getClient = this.getClient.bind(this);
		this.getPlatform = this.getPlatform.bind(this);
		this.getHost = this.getHost.bind(this);
		this.getSessionId = this.getSessionId.bind(this);

		// Change GQL config whenever the configuration change.
		this.subscribe(this.__setGQLConfig.bind(this));
	}

	/**
	 Sets the application's default configuration.

	 @param {object} defaults
	**/
	setDefaults(defaults) {
		this.defaults = defaults;

		// Add the default as state
		this.reset(defaults);

		this.__setGQLConfig.call(this);
	}

	/**
	 Returns the application's host.
	**/
	getHost() {
		const {protocol, host} = this.state;

		return protocol + '://' + host;
	}

	getClient() {
		return this.state.client;
	}

	getSessionId() {
		return this.state.sessionId;
	}

	getPlatform() {
		const ua = new UAParser();

		return {
			browser: ua.getBrowser(),
			device: ua.getDevice(),
			os: ua.getOS()
		};
	}

	toQuery() {
		this.setArgs({
			client: this.state.client,
			platform: this.getPlatform()
		});

		return super.toQuery();
	}

	/**
	 @private
	 @callback
	**/
	__setGQLConfig() {
		const config = {},
			{client, routeEndPoint, sessionId, adminEndPoint, mobileEndPoint} = this.state;

		let url = this.getHost();

		config.url = url + routeEndPoint;

		if ("admin" === client && adminEndPoint) {
			config.url = url + adminEndPoint + routeEndPoint;
		}

		if ("mobile" === client && mobileEndPoint) {
			config.url = url + mobileEndPoint + routeEndPoint;
		}

		if (sessionId) {
			config.headers = {"X-Session-Id": sessionId};
		}

		GQLConfig(config);
	}

	/**
	 @private
	 @callback
	**/
	__onSuccess(res) {
		const state = _.extend({}, this.defaults, res);

		return super.__onSuccess(state);
	}
}

const Config = new ConfigState();

export default Config;

const usedTemplates = {};

/**
 Returns template structure.

 @param {string} pageNow
 @param {string} client
 @param {string} defaults
**/
export function getTemplate(pageNow, defaults = null) {
	const templates = Config.get("templates");

	if (!templates) {
		return null;
	}

	if (templates[pageNow]) {
		if (!usedTemplates[pageNow]) {
			usedTemplates[pageNow] = parseHTML(templates[pageNow]);
		}

		return usedTemplates[pageNow];
	}

	// Check default templates
	const defaultTemplates = Config.get("defaultTemplates")||{};

	if (defaultTemplates[pageNow]) {
		if (!usedTemplates[pageNow]) {
			usedTemplates[pageNow] = parseHTML(defaultTemplates[pageNow]);
		}

		return usedTemplates[pageNow];
	}

	if (templates[defaults]) {
		if (!usedTemplates[defaults]) {
			usedTemplates[defaults] = parseHTML(templates[defaults]);
		}

		return usedTemplates[defaults];
	}

	if (defaultTemplates[defaults]) {
		if (!usedTemplates[defaults]) {
			usedTemplates[defaults] = parseHTML(defaultTemplates[defaults]);
		}

		return usedTemplates[defaults];
	}

	return null;
}

/**
 Check if the url is of the same site.

 @param {string} url
**/
export function isSameSite(url) {
	if (!url || "#" === url) {
		return false;
	}

	if (!url.match(/https|http/)) {
		return true;
	}

	const host = Config.getHost();

	if (url.match(/https|http/)) {
		const pattern = new RegExp(`^${host}`);

		return url.match(pattern);
	}

	const _host = Config.get("host");

	return url && url.match(_host);
}

/**
 * Check if a url is valid for screen loading.
 *
 * @param {string} url
 * @returns {boolean}
 **/
export function isValidUrl(url) {
	if (!url || "#" === url) {
		return false;
	}

	const host = Config.getHost();

	return !url.match(/http|https/) ||
		!!url.match(host);
}

/**
 * Sanitize and fix url for screen loading.
 *
 * @param {string} url
 * @returns {string} url
 **/
export function sanitizeUrl(url) {
	if (!isValidUrl(url)) {
		return url;
	}

	const currentHost = Config.getHost(),
		endPoint = Config.get("endPoint");

	if (url.length > 1 && "/" === url.charAt(url.length-1)) {
        url = url.split("");
        url.pop();

        url = url.join("");
    }

    url = url.replace(currentHost, '');

    if (!endPoint) {
        return url;
    }

    const pattern = new RegExp(`^${endPoint}`);

    if (url.match(pattern)) {
        return url;
    }

    return endPoint + url;
}

/**
 Returns valid URL use as address for client screens.

 @param {string} pathName
**/
export function homeUrl(pathName) {
	const url = sanitizeUrl(pathName);

	return url;
}

/**
 Returns valid URL use as address for admin screens.
**/
export function adminUrl(pathName) {
	const url = sanitizeUrl(pathName),
		adminEndPoint = Config.get("adminEndPoint");

	return adminEndPoint + url;
}

/**
 Returns valid URL use as address for mobile screens
**/
export function mobileUrl(pathName) {}