import {pathToRegexp, compile} from "path-to-regexp";
import {GQLQuery, GQLQueryState} from "@wrapper/gql-client";
import getRoute from "./route";
import {appEvent, appFilter} from "../hook";
import _ from "../utils";
import Config, {isValidUrl, sanitizeUrl, getTemplate, homeUrl, adminUrl} from "../gql-state/config";
import CurrentUser from "../user/current";

const screenQuery = new GQLQuery();

export default class Screen extends GQLQueryState {
	constructor() {
		super({});

		this.screens = {};
		this.refreshBrowser = _.noop;

		// Bind methods for convenience
		this.load = this.load.bind(this);
		this.addScreen = this.addScreen.bind(this);
		this.query = this.query.bind(this);
	}

	/**
	 Check if the current loaded screen is of type client.

	 @returns {Boolean}
	**/
	isClient() {
		return "client" === Config.getClient();
	}

	/**
	 Check if the current loaded screen is of type admin.

	 @returns {Boolean}
	**/
	isAdmin() {
		return "admin" === Config.getClient();
	}

	/**
	 Check if the current loaded screen is of type mobile.

	 @returns {Boolean}
	**/
	isMobile() {
		return "mobile" === Config.getClient();
	}

	/**
	 Loads or reload an screen.

	 @param {string} url
	 	The address of the screen to load to.
	 @param {boolean} refresh
	 	Whether to load the screen if the address is similar to currently loaded screen.
	 @param {string} client
	 	If the given url is different from the loaded screen mode.
	 @param {boolean} isSilent
	 	Whether to load the screen without triggering any attached hooks.
	**/
	load(url, refresh = false, client = false, isSilent = false) {
		if (!url || !isValidUrl(url)) {
			return;
		}

		url = sanitizeUrl(url);

		// Maybe refresh??
		if (client && this.state.client && this.state.client !== client) {
			// Get url absolute path??
			url = "admin" === client ? adminUrl(url) : homeUrl(url);

			this.refreshBrowser(url);

			return;
		}

		const oldUrl = this.state.url;

		if (oldUrl && _.isEqual(oldUrl, url) && !refresh) {
			return;
		}

		this.__getRoute(url).then(route => this.__loadScreen(route, url, refresh, isSilent));	
	}

	/**
	 Adds GQL query to execute.

	 @param {object} query
	 	The query data to add into the list of executable queries to send to the server.
	**/
	addQuery(query) {
		screenQuery.set(query);
	}

	/**
	 Check if the newly loaded screen contains executable queries.

	 @returns {Boolean}
	**/
	hasQueries() {
		return screenQuery.hasQueries();
	}

	/**
	 Sends the query to the server.

	 @returns {Promise<[Error, Data]>}
	**/
	query() {
		if (!this.hasQueries()) {
			return Promise.resolve(true);
		}

		this.canQuery = false;
		
		return screenQuery.exec(this.state).then(this.__handleResponse.bind(this));
	}

	/**
	 Adds screen data.

	 @param {object} screen
	 	{
			@property {string|array} routePath
			@property {string|function} user
				The type of user able to view the screen.
			@property {string|function} permission
				The permission current user must possess to be able to view the screen.
			@property {string} typeNow
				The type of screen.
			@property {string} pageNow
				The template to use for the screen.
			@property {string|function} title
				The screen title to set to.
			@property {string} client
				At which screen type the screen is available to. Options are `client` or `admin` or `mobile`
	 	}
	**/
	addScreen(screen) {
		let {client, routePath, typeNow, pageNow} = screen,
			list = this.screens,
			adminEndPoint = Config.get("adminEndPoint");

		// Create screen Id
		screen.Id = _.toSlug(`${client}-${typeNow}-${pageNow}`);

		routePath = _.isString(routePath) ? [routePath] : routePath;

		for(const route of routePath) {
			screen.routePath = route;

			this.screens[route] = screen;
		}
	}

	/**
	 Quick client screen setter.

	 @param {object} screen
	**/
	addClientScreen(screen) {
		screen.client = "client";

		this.addScreen(screen);
	}

	/**
	 Quick admin screen setter.

	 @param {object} screen
	**/
	addAdminScreen(screen) {
		screen.client = "admin";

		this.addScreen(screen);
	}

	/**
	 Quick template getter.

	 @param {string} templatePath
	 	The relative path of the template to get to. (i.e. /dashboard)
	 @param {string} defaults
	 	The relative path of a template to use if the given template path does not exist.
	 @returns {String}
	**/
	getTemplate(templatePath, defaults = null) {
		return getTemplate(templatePath, defaults);
	}

	/**
	 @private
	**/
	async __getRoute(url) {
		let requireLogin = false;

		for(const route of _.values(this.screens)) {
			let keys = [],
	            routePath = sanitizeUrl(route.routePath),
	            regex = pathToRegexp(routePath, keys),
	            arr = regex.exec(url);

	         if (!arr) {
	         	continue;
	         }

	        let Route = _.extend({params: {}}, route);

	        // Remove the first item of the array
	        arr.shift();

	        keys.map( (param, i) => {
	            Route.params[param.name] = arr[i];
	        });

	        if (Route.user) {
	        	if ("guest" === Route.user && CurrentUser.isLoggedIn()) {
	        		continue;
	        	}

	        	if ("login" === Route.user && !CurrentUser.isLoggedIn()) {
	        		return this.screens["/login"];
	        	}
	        }

	        if (Route.permission) {
	        	if (!CurrentUser.can(Route.permission)) {
	        		// Just display the 404 page
	        		return this.screens["/404"];
	        	}
	        }

	        return Route;
		}

		// Return 404
		return this.screens["/404"];
	}

	/**
	 @private
	**/
	__loadScreen(route, url, refresh, isSilent) {

		// If is of not the same client, refresh
		if (this.state.client && this.state.client !== route.client) {
			this.refreshBrowser(url);

			return;
		}

		// Check client
		const state = _.extend({}, route, {url, refresh});

		// Check title
		if (_.isFunction(state.title)) {
			state.title = state.title.call(null, state, this);
		}

		if (isSilent) {
			this.resetSync(state);

			return;
		}

		/**
		 Trigger to call all hooked listeners before the screen changes.

		 @param {object} state
		 	The state data object to replace the current screen to.
		**/
		appEvent.trigger("screenChange", state).then(() => this.resetSync(state));
	}

	/**
	 @private
	 @callback
	**/
	__handleResponse(res) {
		screenQuery.reset();

		return res;
	}
}