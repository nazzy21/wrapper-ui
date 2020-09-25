import StateModel from "../gql-state/model";
import _ from "../utils";
import {i18n} from "../lang";
import UserMeta from "./meta";

export default class User extends StateModel {
	constructor(fields = ["Id", "login", "email", "group", "status", "createdAt", "updatedAt", "meta", "caps"], user = {}, subscribers = []) {
		super({
			name: "getUser",
			args: {
				Id: {type: "Int!"}
			},
			query: `getUser(Id: $Id) { ${fields.join(" ")}}`,
			defaults: user,
			subscribers
		});

		// Set queries
		this.queries = {
			create: {
				name: "createUser",
				args: {
					user: {type: "UserInput"},
					isSilent: {type: "Boolean"}
				},
				query: `createUser(input: $user){${fields.join(" ")}}`,
				onSuccess: this.__onCreateSuccess.bind(this)
			},
			update: {
				name: "updateUser",
				args: {
					user: {type: "UserInput"},
					isSilent: {type: "Boolean"}
				},
				query: `updateUser(input: $user isSilent: $isSilent){${this.fields.join(" ")}}`,
				onSuccess: this.__onUpdateSuccess.bind(this)
			},
			delete: {
				name: "deleteUser",
				args: {
					Id: {type: "Int!"},
					isSilent: {type: "Boolean"}
				},
				query: `deleteUser(Id: $Id isSilent: $isSilent)`,
				onSuccess: this.__onDeleteSuccess.bind(this)
			}
		};
	}

	/**
	 @private
	**/
	prepareState(state) {
		if (!state.status) {
			// Set default status
			state.status = "pending";
		}

		this.metaData = new UserMeta(state.Id, state.meta||[]);

		return state;
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
	 Creates new user in the database.

	 @param {boolean} isSilent
	 	Whether to create the user in silence, preventing any hooks set in the server from being executed.
	 @param {function} onSuccess
	 	Called after successful user creation.
	 @param {function} onError
	 	Called when an error occurred.
	 @returns {Promise<[Error, Object]>}
	**/
	create(isSilent = false, onSuccess = false, onError = false) {
		// Check required user data.
		if (!this.state.login) {
			return this.__returnError({
				message: i18n("Username is required!"),
				code: "require_login"
			}, onError);
		}

		if (!this.state.email || !_.isEmail(this.state.email)) {
			return this.__returnError({
				message: i18n("Invalid email address!"),
				code: "invalid_email"
			}, onError);
		}

		if (!this.state.pass) {
			return this.__returnError({
				message: i18n("Set user password!"),
				code: "missing_password"
			}, onError);
		}

		if (!this.state.group || !_.isInt(this.state.group)) {
			return this.__returnError({
				message: i18n("Invalid user group!"),
				code: "invalid_group"
			}, onError);
		}

		const user = _.pick(this.state, ["login", "email", "pass", "group", "status"]);

		return this.__mutator("createUser", {user, isSilent}, onSuccess, onError);
	}

	/**
	 Update user data in the database.

	 @param {boolean} isSilent
	 	Whether to update in silence, preventing any update hooks set in the server from being executed.
	 @param {function} onSuccess
	 	Called after successful user creation.
	 @param {function} onError
	 	Called when an error occurred.
	 @returns {Promise<[Error, Object]>}
	**/
	update(isSilent = false, onSuccess = false, onError = false) {
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
			query = this.getQuery("updateUser", {user, isSilent}, onSuccess, onError);

		// Get meta query
		this.mutator.set(query);
		this.mutator.set(this.metaData.getSaveQuery());

		return this.mutator.exec();
	}

	/**
	 Removes user from the database.

	 @param {boolean} isSilent
	 	Whether to delete in silence, preventing any delete hooks set in the server from being executed.
	 @param {function} onSuccess
	 	Called after successful user creation.
	 @param {function} onError
	 	Called when an error occurred.
	 @returns {Promise<[Error, Object]>}
	**/
	delete(isSilent = false, onSuccess = false, onError = false) {
		if (!this.state.Id) {
			return this.__returnError({
				message: i18n("Cannot delete none existent user!"),
				code: "invalid_id"
			}, onError);
		}

		return this.__mutator("deleteUser", {Id: this.state.Id, isSilent}, onSuccess, onError);
	}

	setMeta(name, value) {
		this.metaData.set(name, value);
	}

	unsetMeta(name) {
		this.metaData.unset(name);
	}

	/**
	 @private
	 @callback
	**/
	__onCreateSuccess(user) {
		this.reset(user);

		this.metaData.setArgs({userId: user.Id});

		return this.metaData.save(this.___onCreateSuccess.bind(this), this.errorCallback);
	}

	/**
	 @private
	 @callback
	**/
	___onCreateSuccess() {
		if (this.successCallback) {
			this.successCallback.call(null, this.state, this);
		}

		this.successCallback = false;
		this.errorCallback = false;
	}

	/**
	 @private
	 @callback
	**/
	__onUpdateSuccess(user) {
		this.resetSync(user);

		if (this.successCallback) {
			this.successCallback.call(null, this.state, this);
		}

		this.successCallback = false;
		this.errorCallback = false;
	}

	/**
	 @private
	 @callback
	**/
	__onDeleteSuccess() {
		this.resetSync({});

		if (this.successCallback) {
			this.successCallback.call(null, this.state, this);
		}

		this.successCallback = false;
		this.errorCallback = false;
	}
}