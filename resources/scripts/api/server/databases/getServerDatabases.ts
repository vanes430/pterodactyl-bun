import http, {
	type FractalResponseData,
	type FractalResponseList,
} from "@/api/http";

export interface ServerDatabase {
	id: string;
	name: string;
	username: string;
	connectionString: string;
	allowConnectionsFrom: string;
	password?: string;
}

export interface ServerDatabaseAttributes {
	id: string;
	name: string;
	username: string;
	host: {
		address: string;
		port: number;
	};
	connections_from: string;
	relationships?: {
		password?: FractalResponseData<{ password?: string }>;
	};
}

export const rawDataToServerDatabase = (
	data: ServerDatabaseAttributes,
): ServerDatabase => ({
	id: data.id,
	name: data.name,
	username: data.username,
	connectionString: `${data.host.address}:${data.host.port}`,
	allowConnectionsFrom: data.connections_from,
	password: data.relationships?.password?.attributes?.password,
});

export default (
	uuid: string,
	includePassword = true,
): Promise<ServerDatabase[]> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalResponseList<ServerDatabaseAttributes>>(
				`/api/client/servers/${uuid}/databases`,
				{
					params: includePassword ? { include: "password" } : undefined,
				},
			)
			.then((response) =>
				resolve(
					response.data.data.map((item) =>
						rawDataToServerDatabase(item.attributes),
					),
				),
			)
			.catch(reject);
	});
};
