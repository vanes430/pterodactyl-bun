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
import { useServerSWRKey } from "@/plugins/useSWRKey";
import { ServerContext } from "@/state/server";

export type ActivityLogFilters = QueryBuilderParams<
	"ip" | "event",
	"timestamp"
>;

const useActivityLogs = (
	filters?: ActivityLogFilters,
	config?: SWRConfiguration<PaginatedResult<ActivityLog>, HttpRequestError>,
): SWRResponse<PaginatedResult<ActivityLog>, HttpRequestError> => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const key = useServerSWRKey(["activity", useFilteredObject(filters || {})]);

	return useSWR<PaginatedResult<ActivityLog>>(
		key,
		async () => {
			const { data } = await http.get<
				FractalPaginatedResponse<ActivityLogAttributes>
			>(`/api/client/servers/${uuid}/activity`, {
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
