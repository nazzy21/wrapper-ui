import {GQLQueryState, GQLMutation, gqlMutator, gqlQuery} from "@wrapper/gql-client";
import _ from "../utils";

/**
 Query State Model
**/
export default class StateModel extends GQLQueryState {
	constructor(props) {
		super(props);

		this.isDirty = false;
		this.queries = props.queries||{};
		this.mutator = new GQLMutation();

		// Bind methods for convenience
		this.__onDeleteSuccess = this.__onDeleteSuccess.bind(this);
	}

	set(name, value) {
		this.oldState = _.extend({}, this.state);

        if (_.isObject(name)) {
            _.extend(this.state, name);

            this.isDirty = !_.isEqual(this.oldState, this.state);

            return;
        }

        this.state[name] = value;
        this.isDirty = !_.isEqual(this.oldState, this.state);
	}

	reset(state) {
		this.state = state;
		this.isDirty = true;
	}

	getId() {
		return this.state.Id;
	}

	getQueries() {
		return this.queries;
	}

	getQuery(name, vars = {}, onSuccess = false, onError = false) {
		const queries = this.getQueries();
		if (!queries[name]) {
			return null;
		}

		this.successCallback = onSuccess;
		this.errorCallback = onError;

		const query = _.clone(queries[name]),
			args = query.args;

		query.onSuccess = query.onSuccess || this.__onSuccess;
		query.onError = query.onError || this.__onError;

		if (!args) {
			return query;
		}

		for(const key of _.keys(args)) {
			if (vars[key]) {
				args[key].value = vars[key];

				continue;
			}

			if (this.state[key]) {
				args[key].value = this.state[key];
			}
		}

		query.args = args;

		return query;
	}

	/**
	 @private
	**/
	__mutator(name, vars, onSuccess = false, onError = false) {
		const query = this.getQuery(name, false, onSuccess, onError);

		return gqlMutator(query, vars || this.state);
	}

	/**
	 @private
	**/
	__query(name, vars, onSuccess = false, onError = false) {
		const query = this.getQuery(name, false, onSuccess, onError);

		return gqlQuery(query, vars||false);
	}

	__onDeleteSuccess() {
		this.resetSync({});

		if (this.successCallback) {
			this.successCallback.call(null, this.state, this);
		}

		this.successCallback = false;
		this.errorCallback = false;
		this.isDirty = false;
	}

	__onSuccess(res) {
		super.__onSuccess(res);
		this.isDirty = false;
	}

	__returnError(err, onError = false) {
		if (onError) {
			onError.call(null, err, this);

			return;
		}

		return Promise.resolve([err]);
	}
}