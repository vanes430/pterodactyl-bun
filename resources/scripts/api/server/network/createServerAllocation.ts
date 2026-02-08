import type { AllocationAttributes } from "@/api/definitions/api";
import http, { type FractalResponseData } from "@/api/http";
import type { Allocation } from "@/api/server/getServer";
import { rawDataToServerAllocation } from "@/api/transformers";

export default async (uuid: string): Promise<Allocation> => {
	const { data } = await http.post<FractalResponseData<AllocationAttributes>>(
		`/api/client/servers/${uuid}/network/allocations`,
	);

	return rawDataToServerAllocation(data);
};
