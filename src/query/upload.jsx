//import {GQLMutation} from "../gql";
import {GQLUpload} from "../gql";
import Config from "../config";

export default function uploadFile(file, onSuccess = false, onError = false) {
	const gql = new GQLUpload();
	gql.set({
		name: "uploadFile",
		//args: {},
		query: `uploadFile`,
		onSuccess,
		onError
	});

	gql.addFile("file", file);

	return gql.exec().then(res => gql.handleResponse(res));
}