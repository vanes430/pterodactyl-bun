import type { EggVariableAttributes } from "@/api/definitions/api";
import http, { type FractalResponseData } from "@/api/http";
import type { ServerEggVariable } from "@/api/server/types";
import { rawDataToServerEggVariable } from "@/api/transformers";

export default async (
	uuid: string,
	key: string,
	value: string,
): Promise<[ServerEggVariable, string]> => {
	const { data } = await http.put<
		FractalResponseData<EggVariableAttributes> & {
			meta: { startup_command: string };
		}
	>(`/api/client/servers/${uuid}/startup/variable`, { key, value });

	return [rawDataToServerEggVariable(data), data.meta.startup_command];
};
