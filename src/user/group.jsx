import StateModel from "../gql-client/model";
import _ from "../utils";
import {i18n} from "../lang";

export default class UserGroup extends StateModel {
	constructor(fields = ["Id", "name", "slug", "description", "caps", "userCount", "userStatusCount"], suscribers = []) {
		super({
			name: "getUserGroups",
			query: `getUserGroups{ ${fields.join(" ")} }`,
			suscribers
		});

		this.queries = {
			create: {
				name: "createUserGroup",
				args: {
					group: {type: "UserGroupInput"}
				},
				query: `createUserGroup(input: $group){ ${fields.join(" ")} }`,
				onSuccess: this.__onCreateSuccess.bind(this)
			},
			update: {
				name: "updateUserGroup",
				args: {
					group: {type: "UserGroupInput"}
				},
				query: `updateUserGroup(input: $group){ ${fields.join(" ")} }`,
				onSuccess: this.__onCreateSuccess.bind(this)
			},
			delete: {
				name: "deleteUserGroup",
				args: {
					Id: {type: "Int!"},
					action: {type: "String"},
					value: {type: "Object"}
				},
				query: `deleteUserGroup(Id: $Id action: $action value: $value)`,
				onDeleteSuccess: this.__onDeleteSuccess.bind(this)
			}
		};
	}

	prepareState(state) {
		state = _.indexOf(state, "Id");

		return state;
	}

	/**
	 Adds new user group.

	 @param {object} group
	 	{
			@property {string} name
			@property {string} description
			@property {array} caps
	 	}
	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Object]>}
	**/
	add(group, onSuccess = false, onError = false) {
		if (!group.name) {
			return this.__returnError({
				message: i18n("Group name is required!"),
				code: "missing_group_name"
			}, onError);
		}

		return this.__mutator("create", {group}, onSuccess, onError);
	}

	/**
	 Updates user group in the database.

	 @param {object} group
	 	{
			@property {string} name
			@property {string} description
			@property {array} caps
	 	}
	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Object]>}
	**/
	update(group, onSuccess = false, onError = false) {
		if (!group.Id) {
			return this.__returnError({
				message: i18n("Cannot update none existing user group!"),
				code: "not_exist"
			}, onError);
		}

		return this.__mutator("update", {group}, onSuccess, onError);
	}

	/**
	 Deletes user group in the database.

	 @param {int} groupId
	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Boolean]>}
	**/
	delete(groupId, onSuccess = false, onError = false) {
		this.successCallback = onSuccess;

		return this.__mutator("delete", {Id: groupId}, res => this.__onDeleteSuccess(res, groupId), onError);
	}

	/**
	 @private
	 @callback
	**/
	__onCreateSuccess(group) {
		this.setSync(group.slug, group);

		if (this.successCallback) {
			this.successCallback.call(null, group, this.state, this);
		}

		this.successCallback = false;
		this.errorCallback = false;
	}

	/**
	 @private
	 @callback
	**/
	__onDeleteSuccess(res, groupId) {
		this.unsetSync(groupId);

		if (this.successCallback) {
			this.successCallback.call(null, group, this.state, this);
		}

		this.successCallback = false;
		this.errorCallback = false;
	}
}