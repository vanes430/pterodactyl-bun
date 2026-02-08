import type { Model } from "@definitions/index";
import {
	type FractalPaginatedResponse,
	type FractalResponseData,
	type FractalResponseList,
	getPaginationSet,
	type PaginatedResult,
} from "@/api/http";

type TransformerFunc<T, A = any> = (callback: FractalResponseData<A>) => T;

const isList = (
	data: FractalResponseList | FractalResponseData,
): data is FractalResponseList => data.object === "list";

function transform<T, M, A = any>(
	data: null | undefined,
	transformer: TransformerFunc<T, A>,
	missing?: M,
): M;
function transform<T, M, A = any>(
	data: FractalResponseData<A> | null | undefined,
	transformer: TransformerFunc<T, A>,
	missing?: M,
): T | M;
function transform<T, M, A = any>(
	data: FractalResponseList<A> | FractalPaginatedResponse<A> | null | undefined,
	transformer: TransformerFunc<T, A>,
	missing?: M,
): T[] | M;
function transform<T, A = any>(
	data:
		| FractalResponseData<A>
		| FractalResponseList<A>
		| FractalPaginatedResponse<A>
		| null
		| undefined,
	transformer: TransformerFunc<T, A>,
	missing: any = undefined,
) {
	if (data === undefined || data === null) {
		return missing;
	}

	if (isList(data)) {
		return data.data.map(transformer);
	}

	if (!data || !data.attributes || data.object === "null_resource") {
		return missing;
	}

	return transformer(data);
}

function toPaginatedSet<M extends Model, A = any>(
	response: FractalPaginatedResponse<A>,
	transformer: TransformerFunc<M, A>,
): PaginatedResult<M> {
	return {
		items: transform(response, transformer),
		pagination: getPaginationSet(response.meta.pagination),
	};
}

export { transform, toPaginatedSet };
