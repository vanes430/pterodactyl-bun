import http, {
	type FractalPaginatedResponse,
	getPaginationSet,
	type PaginatedResult,
} from "@/api/http";
import {
	rawDataToServerObject,
	type Server,
	type ServerResponseAttributes,
} from "@/api/server/getServer";

interface QueryParams {
	query?: string;
	page?: number;
	type?: string;
}

export default ({
	query,
	...params
}: QueryParams): Promise<PaginatedResult<Server>> => {
	return new Promise((resolve, reject) => {
		http
			.get<FractalPaginatedResponse<ServerResponseAttributes>>("/api/client", {
				params: {
					"filter[*]": query,
					...params,
				},
			})
			.then(({ data }) =>
				resolve({
					items: data.data.map((datum) => rawDataToServerObject(datum)),
					pagination: getPaginationSet(data.meta.pagination),
				}),
			)
			.catch(reject);
	});
};
