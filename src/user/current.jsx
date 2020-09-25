import StateModel from "../gql-state/model";
import Config from "../gql-state/config";
import _ from "../utils";
import {i18n} from "../lang";
import UserMeta from "./meta";

class CurrentUserState extends StateModel {
	constructor(fields = ["sessionId", "Id", "login", "email", "group", "status", "createdAt", "updatedAt", "meta{Id userId name value}", "caps"], subscribers = []) {
		super({
			name: "getCurrentUser",
			query: `getCurrentUser{${fields.join(" ")}}`,
			defaults: {Id: 0},
			subscribers
		});

		this.queries = {
			login: {
				name: "login",
				args: {
					usr: {type: "String!"},
					pwd: {type: "String!"},
					client: {
						type: "String",
						value: Config.getClient
					},
					platform: {
						type: "Object",
						value: Config.getPlatform
					}
				},
				query: `login(usr: $usr pwd: $pwd client: $client platform: $platform) { ${fields.join(" ")} }`
			},
			logout: {
				name: "logout",
				args: {
					client: {
						type: "String",
						value: Config.getClient
					},
					platform: {
						type: "Object",
						value: Config.getPlatform
					}
				},
				query: "logout(client: $client platform: $platform)",
				onSuccess: this.__onLogoutSuccess.bind(this)
			}
		};

		this.fields = fields;
	}

	/**
	 @private
	**/
	prepareState(state) {
		this.metaData = new UserMeta(state.Id, state.meta || {});

		return state;
	}

	/**
	 Check if user is currently logged in.

	 @returns {boolean}
	**/
	isLoggedIn() {
		return this.state.Id && this.state.Id > 0;
	}

	/**
	 Check if user has the specified permission.

	 @param {string} permission
	 @returns {boolean}
	**/
	can(permission) {
		const caps = this.state.caps||[];

		return _.contain(caps, permission);
	}

	/**
	 Get user's setting.

	 @param {string} name
	 @returns {*}
	**/
	getSetting(name) {
		return this.metaData.get(name);
	}

	/**
	 Set or reset user's setting.

	 @param {string} name
	 @param {*} value
	 @param {function} onSuccess
	 @param {function} onError
	**/
	setSetting(name, value, onSuccess = false, onError = false) {
		this.metaData.set(name, value);

		return this.metaData.save(onSuccess, onError);
	}

	setMeta(name, value) {
		this.metaData.set(name, value);
	}

	unsetMeta(name) {
		this.metaData.unset(name);
	}

	/**
	 Logs user into the system.

	 @param {user}
	 	{
			@property {string} usr
			@property {string} pwd
	 	}
	 @param {function} onSuccess
	 @param {function} onError
	**/
	login(user, onSuccess = false, onError = false) {
		return this.__mutator("login", user, onSuccess, onError);
	}

	/**
	 Log the user out from the system.

	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Object]>}
	**/
	logout(onSuccess = false, onError = false) {
		return this.__query("logout", {}, onSuccess, onError);
	}

	/**
	 Update current user's profile.

	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Object]>}
	**/
	update(onSuccess = false, onError = false) {
		if (!this.isDirty) {
			// Do nothing
			return Promise.resolve([null, this.state]);
		}

		if (!this.state.Id) {
			return this.__returnError({
				message: i18n("Cannot update none existent user!"),
				code: "invalid_id"
			}, onError);
		}

		const user = _.pick(this.state, ["Id", "login", "email", "pass", "group", "status"]),
			query = this.getQuery("updateUser", {user}, onSuccess, onError);

		// Get meta query
		this.mutator.set(query);
		this.mutator.set(this.metaData.getSaveQuery());

		return this.mutator.exec();
	}

	/**
	 @private
	 @callback
	**/
	__onSuccess(user) {
		super.__onSuccess(user);

		if (user.sessionId) {
			// Update config data session Id
			Config.setSync({sessionId: user.sessionId});
		}
	}

	/**
	 @private
	 @callback
	**/
	__onLogoutSuccess(sessionId) {
		this.resetSync({Id: 0});

		if (this.successCallback) {
			this.successCallback.call(null, this.state, this);
		}

		this.successCallback = false;
		this.errorCallback = false;

		Config.setSync({sessionId});
	}
}

const currentUser = new CurrentUserState();

export default currentUser;

export {CurrentUserState};