import StateModel from "../gql-client/model";
import _ from "../utils";

export default class UserQuery extends StateModel {
	constructor(args = {}, fields = ["foundUsers", "statuses", "users{Id login email status group createdAt updatedAt caps meta}"], subscribers = []) {
		super({
			name: "userQuery",
			args: {
				search: {type: "String"},
				group: {type: "Int"},
				groupIn: {type: "[Int]"},
				status: {type: "String"},
				statusIn: {type: "[String]"},
				page: {type: "Int"},
				perPage: {type: "Int"},
				sortBy: {type: "String"},
				sort: {type: "String"}
			},
			query: `userQuery(
				search: $search
				group: $group
				groupIn: $groupIn
				status: $status
				statusIn: $statusIn 
				page: $page 
				perPage: $perPage
				sortBy: $sortBy 
				sort: $sort
			){ ${fields.join(" ")} }`
		});
	}

	prepareState(state) {
		if (state.users) {
			state.users = _.indexBy(state.users, "Id");
		}

		return state;
	}

	/**
	 Returns the list of users found in a query.
	**/
	getResults() {
		return _.values(this.state.users);
	}

	/**
	 Returns the number of users found in the database base on the set query arguments.
	**/
	getFoundUsers() {
		return this.state.foundUsers||0;
	}

	/**
	 Returns an object containing the user's status base on the set query arguments
	 with it's total count.
	**/
	getStatuses() {
		return this.state.statuses||{};
	}

	/**
	 Returns the total number of users found in the database.
	**/
	getUserCount() {
		return this.state.userCount||0;
	}

	/**
	 Returns an object containing the all user statuses found in the database
	 with it's total count per status.
	**/
	getUserStatuses() {
		return this.state.statusCount||{};
	}

	/**
	 Returns user's data.

	 @param {int} userId
	**/
	get(userId) {
		return this.state.users[userId];
	}

	/**
	 Check if there's more users to query to.

	 @returns {Boolean}
	**/
	hasNext() {
		const perPage = this.getArg("perPage");

		if (!perPage) {
			return false;
		}

		const total = this.getFoundUsers(),
			maxPages = Math.ciel(total/perPage),
			page = this.getArg("page")||1;

		return maxPages > (page+1);
	}

	/**
	 Get the next batch of users.

	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Object]>}
	**/
	getNext(onSuccess = false, onError = false) {
		if (!this.hasNext()) {
			return;
		}

		let page = this.getArg("page") + 1;

		this.setArgs({page});

		return this.query(onSuccess, onError);
	}

	/**
	 Get the previously fetch batch of users.

	 @param {function} onSuccess
	 @param {function} onError
	 @returns {Promise<[Error, Object]>}
	**/
	getPrevious(onSuccess = false, onError = false) {
		let page = this.getArg("page");

		if (page <= 1) {
			return;
		}

		page = page - 1;
		this.setArgs({page});

		return this.query(onSuccess, onError);
	}
}