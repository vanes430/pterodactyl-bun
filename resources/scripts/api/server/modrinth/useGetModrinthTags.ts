import axios from "axios";
import useSWR from "swr";

export interface ModrinthTag {
	name: string;
	version?: string;
	version_type?: string;
}

export const useGetModrinthTags = () => {
	const gameVersions = useSWR<ModrinthTag[]>(
		"modrinth:tags:game_versions",
		async () => {
			const response = await axios.get<ModrinthTag[]>(
				"https://api.modrinth.com/v2/tag/game_version",
				{
					headers: { "User-Agent": "pterodactyl-modrinth-installer" },
				},
			);
			// Filter only release versions of Minecraft (no alpha/beta/snapshot)
			return response.data
				.filter((v) => v.version_type === "release")
				.slice(0, 50);
		},
		{ revalidateOnFocus: false },
	);

	const loaders = useSWR<ModrinthTag[]>(
		"modrinth:tags:loaders",
		async () => {
			const response = await axios.get<ModrinthTag[]>(
				"https://api.modrinth.com/v2/tag/loader",
				{
					headers: { "User-Agent": "pterodactyl-modrinth-installer" },
				},
			);
			// Filter loaders that are relevant for plugins
			const pluginLoaders = [
				"paper",
				"spigot",
				"bukkit",
				"velocity",
				"folia",
				"bungeecord",
				"purpur",
				"waterfall",
			];
			return response.data.filter((l) => pluginLoaders.includes(l.name));
		},
		{ revalidateOnFocus: false },
	);

	return {
		gameVersions: gameVersions.data || [],
		loaders: loaders.data || [],
		isLoading:
			(!gameVersions.data && !gameVersions.error) ||
			(!loaders.data && !loaders.error),
	};
};
