import http, { type FractalResponseData } from "@/api/http";

export default (uuid: string, file: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalResponseData<{ url: string }>>(
				`/api/client/servers/${uuid}/files/download`,
				{
					params: { file },
				},
			)
			.then(({ data }) => resolve(data.attributes.url))
			.catch(reject);
	});
};
