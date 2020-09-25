import Config from "../config";
import {GQLQuery, GQLQueryState} from "../gql";
import * as _ from "../utils";

export default function createSession(onSuccess = false, onError = false) {
	const gql = new GQLQuery();
	gql.set({
		name: "createSession",
		args: {
			clientId: {
				type: "String",
				value: Config.get("clientId")
			},
			client: {
				type: "String",
				value: Config.getClient()
			},
			platform: {
				type: "Object",
				value: Config.getPlatform()
			}
		},
		query: `createSession(clientId: $clientId client: $client platform: $platform)`,
		
		onSuccess(sessionId) {
			Config.setSync({sessionId});
			Config.setGQLConfig();

			if (onSuccess) {
				onSuccess.call(null, sessionId);
			}
		},
		onError
	});

	return gql.exec().then(res => gql.handleResponse(res, "getSessionId"));
}