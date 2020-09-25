import Config from "../config";
import {GQLQuery, GQLQueryState} from "../gql";
import * as _ from "../utils";

const ConfigQuery = new (class ConfigQueryState extends GQLQueryState {
	constructor() {
		super({
			name: "Config",
			args: {
				client: {
					type: "String!",
					value: Config.getClient
				},
				clientId: {
					type: "String",
					value: () => Config.state.clientId
				}
			},
			query: `Config(client: $client clientId: $clientId){
				sessionId
				templates
				settings
			}`
		});
	}

	onSuccess(res) {
		const state = _.extend({}, Config.defaults, res || {});

		Config.resetSync(state);
		Config.setGQLConfig();
	}
});

export default ConfigQuery;