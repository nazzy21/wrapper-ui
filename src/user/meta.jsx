import StateModel from "../gql-state/model";
import _ from "../utils";
import {i18n} from "../lang";

export default class UserMeta extends StateModel {
	constructor(userId, metas = []) {
		super({
			name: "getUserMeta",
			args: {
				userId: {type: "Int!"}
			},
			query: `getUserMeta(userId: $userId) {Id name value}`,
			defaults: metas
		});

		// Set queries
		this.queries.set = {
			name: "setUserMetaData",
			args: {
				userId: {type: "Int!"},
				meta: {type: "[InputMeta]"},
				deletable: {type: "[Int]"}
			},
			query: "setUserMetaData(input: $meta){Id name value}"
		};

		// Hold meta data
		this.deletables = {};
		this.setables = {};

		// Bind methods for convenience
		this.save = this.save.bind(this);
	}

	prepareState(metas) {
		return _.indexBy(metas, "name");
	}

	/**
	 Sets or update user's meta data.

	 @param {string} name
	 @param {*} value
	 @return {void}
	**/
	set(name, value) {
		const meta = {name, value},
			oldMeta = this.state[name];

		meta.userId = this.getArg("userId");

		if (oldMeta) {
			meta.Id = oldMeta.Id;
		}

		// Update state
		this.state[name] = meta;
		this.isDirty = true;
		this.setables[name] = meta;
	}

	/**
	 Remove user's meta data.

	 @param {string} name
	 @returns {void}
	**/
	unset(name) {
		if (!this.state[name]) {
			return;
		}

		this.deletables[name] = this.state[name];
		delete this.state[name];
	}

	/**
	 Saves user's metadata to the database.

	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Object]>}
	**/
	save(onSuccess = false, onError = false) {
		const vars = this.__getVars();

		return this.__mutator("set", vars, onSuccess, onError);
	}

	/**
	 Returns an object use to create a set query.

	 @param {function} onSuccess
	 @param {function} onError
	**/
	getSaveQuery(onSuccess = false, onError = false) {
		const vars = this.__getVars();

		return this.getQuery("set", vars, onSuccess, onError);
	}

	/**
	 @private
	 @callback
	**/
	__getVars() {
		const metas = [],
			deletable = [],
			userId = this.getArg("userId");

		// Check if an Id is updated
		for(const meta of _.values(this.setables)) {
			if (!meta.userId) {
				meta.userId = userId;
			}

			metas.push(meta);
		}

		for(const {Id} of _.values(this.deletable)) {
			if (Id) {
				deletable.push(Id);
			}
		}

		return {userId, metas, deletable};
	}
}