import useSWR, { type SWRConfiguration } from "swr";
import type { EggVariableAttributes } from "@/api/definitions/api";
import http, { type FractalResponseList } from "@/api/http";
import type { ServerEggVariable } from "@/api/server/types";
import { rawDataToServerEggVariable } from "@/api/transformers";

interface Response {
	invocation: string;
	variables: ServerEggVariable[];
	dockerImages: Record<string, string>;
}

export default (
	uuid: string,
	initialData?: Response | null,
	config?: SWRConfiguration<Response>,
) =>
	useSWR(
		[uuid, "/startup"],
		async (): Promise<Response> => {
			const { data } = await http.get<
				FractalResponseList<EggVariableAttributes> & {
					meta: {
						startup_command: string;
						docker_images: Record<string, string>;
					};
				}
			>(`/api/client/servers/${uuid}/startup`);

			const variables = (data.data || []).map(rawDataToServerEggVariable);

			return {
				variables,
				invocation: data.meta.startup_command,
				dockerImages: data.meta.docker_images || {},
			};
		},
		{
			initialData: initialData || undefined,
			errorRetryCount: 3,
			...(config || {}),
		},
	);
