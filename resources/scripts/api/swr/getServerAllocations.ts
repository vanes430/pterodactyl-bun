import useSWR from "swr";
import type { AllocationAttributes } from "@/api/definitions/api";
import http, { type FractalResponseList } from "@/api/http";
import type { Allocation } from "@/api/server/getServer";
import { rawDataToServerAllocation } from "@/api/transformers";
import { ServerContext } from "@/state/server";

export default () => {
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);

	return useSWR<Allocation[]>(
		["server:allocations", uuid],
		async () => {
			const { data } = await http.get<
				FractalResponseList<AllocationAttributes>
			>(`/api/client/servers/${uuid}/network/allocations`);

			return (data.data || []).map(rawDataToServerAllocation);
		},
		{ revalidateOnFocus: false, revalidateOnMount: false },
	);
};
