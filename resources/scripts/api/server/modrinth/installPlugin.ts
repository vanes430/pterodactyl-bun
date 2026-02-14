import createDirectory from "@/api/server/files/createDirectory";
import loadDirectory from "@/api/server/files/loadDirectory";
import pullFile from "@/api/server/files/pullFile";

export const installPlugin = async (
	uuid: string,
	url: string,
): Promise<string | null> => {
	const rootFiles = await loadDirectory(uuid, "/");
	const hasPluginsFolder = rootFiles.some(
		(f) => f.name.toLowerCase() === "plugins" && !f.isFile,
	);

	if (!hasPluginsFolder) {
		await createDirectory(uuid, "/", "plugins");
	}

	// Smart Duplicate Detection Logic
	const pluginFiles = await loadDirectory(uuid, "/plugins");
	const targetFilename = url.split("/").pop() || "";
	const baseName = targetFilename.split("-")[0].split(".")[0].toLowerCase();

	const duplicate = pluginFiles.find(
		(f) =>
			f.isFile &&
			f.name.toLowerCase().endsWith(".jar") &&
			f.name.toLowerCase().startsWith(baseName) &&
			f.name.toLowerCase() !== targetFilename.toLowerCase(),
	);

	await pullFile(uuid, "/plugins", url);

	return duplicate ? duplicate.name : null;
};
