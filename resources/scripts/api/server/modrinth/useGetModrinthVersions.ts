import axios from "axios";
import useSWR from "swr";
import type { ModrinthVersion } from "@/api/server/modrinth/types";

export const useGetModrinthVersions = (projectId: string | null) => {
	return useSWR<ModrinthVersion[]>(
		projectId ? ["modrinth:versions", projectId] : null,
		async () => {
			const response = await axios.get<ModrinthVersion[]>(
				`https://api.modrinth.com/v2/project/${projectId}/version`,
				{
					headers: {
						"User-Agent":
							"pterodactyl-modrinth-installer (https://github.com/pterodactyl)",
					},
				},
			);

			return response.data;
		},
		{
			revalidateOnFocus: false,
			shouldRetryOnError: false,
		},
	);
};
