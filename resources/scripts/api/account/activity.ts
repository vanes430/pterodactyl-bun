import { toPaginatedSet } from "@definitions/helpers";
import { type ActivityLog, Transformers } from "@definitions/user";
import type { ActivityLogAttributes } from "@definitions/user/transformers";
import useSWR, { type SWRConfiguration, type SWRResponse } from "swr";
import http, {
	type FractalPaginatedResponse,
	type HttpRequestError,
	type PaginatedResult,
	type QueryBuilderParams,
	withQueryBuilderParams,
} from "@/api/http";
import useFilteredObject from "@/plugins/useFilteredObject";
import { useUserSWRKey } from "@/plugins/useSWRKey";

export type ActivityLogFilters = QueryBuilderParams<
	"ip" | "event",
	"timestamp"
>;

const useActivityLogs = (
	filters?: ActivityLogFilters,
	config?: SWRConfiguration<PaginatedResult<ActivityLog>, HttpRequestError>,
): SWRResponse<PaginatedResult<ActivityLog>, HttpRequestError> => {
	const key = useUserSWRKey([
		"account",
		"activity",
		JSON.stringify(useFilteredObject(filters || {})),
	]);

	return useSWR<PaginatedResult<ActivityLog>>(
		key,
		async () => {
			const { data } = await http.get<
				FractalPaginatedResponse<ActivityLogAttributes>
			>("/api/client/account/activity", {
				params: {
					...withQueryBuilderParams(filters),
					include: ["actor"],
				},
			});

			return toPaginatedSet(data, Transformers.toActivityLog);
		},
		{ revalidateOnMount: false, ...(config || {}) },
	);
};

export { useActivityLogs };
