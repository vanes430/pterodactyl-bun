import http, { type FractalResponseData } from "@/api/http";
import {
	rawDataToServerDatabase,
	type ServerDatabase,
	type ServerDatabaseAttributes,
} from "@/api/server/databases/getServerDatabases";

export default (uuid: string, database: string): Promise<ServerDatabase> => {
	return new Promise((resolve, reject) => {
		http
			.post<FractalResponseData<ServerDatabaseAttributes>>(
				`/api/client/servers/${uuid}/databases/${database}/rotate-password`,
			)
			.then((response) =>
				resolve(rawDataToServerDatabase(response.data.attributes)),
			)
			.catch(reject);
	});
};
