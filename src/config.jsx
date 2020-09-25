import {GQLConfig} from "./gql/client";
import State from "./state";
import {extend, setUrl} from "./utils";
import {parseHTML} from "./parser";
import UAParser from "ua-parser-js";

class ConfigState extends State {
	constructor() {
		super("Config");

		this.defaults = {};

		// Bind methods for convenience
		this.getClient = this.getClient.bind(this);
		this.getSessionId = this.getSessionId.bind(this);
		this.getPlatform = this.getPlatform.bind(this);
	}

	setDefaults(defaults) {
		this.defaults = defaults;

		this.reset(defaults);
		this.setGQLConfig();
	}

	setClient(client) {
		if (this.state.client === client) {
			return; // Do nothing
		}

		this.set({client});
	}

	setGQLConfig() {
		const {authKey, routeEndPoint, sessionId} = this.state,
			headers = {url: routeEndPoint};

		if (sessionId) {
			headers['X-Session-Id'] = sessionId;
		}

		GQLConfig(headers);
	}

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

	getAuthKey(onSuccess = false, onError = false) {
		this.gql.reset();
		this.gql.set({
			name: "getAuthKey",
			args: {
				client: {
					type: "String",
					value: this.getClient
				},
				platform: {
					type: "Object",
					value: this.getPlatform
				},
				sessionId: {
					type: "String",
					value: this.getSessionId
				}
			},
			query: `getAuthKey(sessionId: $sessionId client: $client platform: $platform)`,
			onSuccess,
			onError
		});

		return this.gql.exec()
			.then(res => this.handleResponse(res, "getAuthKey"));
	}
}

const Config = new ConfigState();

export default Config;

const usedTemplates = {};

/**
 * Returns screen template.
 *
 * @param {string} pageNow
 * @param {string} defaults
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

	if (templates[defaults]) {
		if (!usedTemplates[defaults]) {
			usedTemplates[defaults] = parseHTML(templates[defaults]);
		}

		return usedTemplates[defaults];
	}

	return null;
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

//????
export function toUrl(params = {}) {
	const endPoint = Config.get("endPoint");

	return setUrl(endPoint, params);
}