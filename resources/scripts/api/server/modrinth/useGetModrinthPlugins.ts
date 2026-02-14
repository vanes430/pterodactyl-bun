import axios from "axios";
import useSWR from "swr";
import type { ModrinthSearchResponse } from "@/api/server/modrinth/types";

export const useGetModrinthPlugins = (query: string, page: number) => {
	return useSWR<ModrinthSearchResponse>(
		["modrinth:search", query, page],
		async () => {
			const limit = 20;
			const offset = (page - 1) * limit;

			// Default facets for Spigot/Paper plugins
			const facets = JSON.stringify([
				[
					"categories:spigot",
					"categories:paper",
					"categories:velocity",
					"categories:folia",
				],
			]);

			const response = await axios.get<ModrinthSearchResponse>(
				"https://api.modrinth.com/v2/search",
				{
					params: {
						query,
						limit,
						offset,
						facets,
						index: "relevance",
					},
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
