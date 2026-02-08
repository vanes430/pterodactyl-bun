import { type ApiKey, rawDataToApiKey } from "@/api/account/getApiKeys";
import http, { type FractalResponseData } from "@/api/http";

export default (
	description: string,
	allowedIps: string,
): Promise<ApiKey & { secretToken: string }> => {
	return new Promise((resolve, reject) => {
		http
			.post<FractalResponseData & { meta: { secret_token: string } }>(
				"/api/client/account/api-keys",
				{
					description,
					allowed_ips: allowedIps.length > 0 ? allowedIps.split("\n") : [],
				},
			)
			.then(({ data }) =>
				resolve({
					...rawDataToApiKey(data.attributes),
					// eslint-disable-next-line camelcase
					secretToken: data.meta?.secret_token ?? "",
				}),
			)
			.catch(reject);
	});
};
