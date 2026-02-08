import http, { type FractalResponseData } from "@/api/http";

export default (uuid: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalResponseData<{ url: string }>>(
				`/api/client/servers/${uuid}/files/upload`,
			)
			.then(({ data }) => resolve(data.attributes.url))
			.catch(reject);
	});
};
