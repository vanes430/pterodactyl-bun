import { Puzzle, Search } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import tw from "twin.macro";
import { installPlugin } from "@/api/server/modrinth/installPlugin";
import type {
	ModrinthPlugin,
	ModrinthVersion,
} from "@/api/server/modrinth/types";
import { useGetModrinthPlugins } from "@/api/server/modrinth/useGetModrinthPlugins";
import Button from "@/components/elements/Button";
import Input from "@/components/elements/Input";
import Pagination from "@/components/elements/Pagination";
import ServerContentBlock from "@/components/elements/ServerContentBlock";
import Spinner from "@/components/elements/Spinner";
import FlashMessageRender from "@/components/FlashMessageRender";
import PluginCard from "@/components/server/modrinth/PluginCard";
import VersionModal from "@/components/server/modrinth/VersionModal";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

const ModrinthContainer = () => {
	const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
	const { addFlash, clearAndAddHttpError, clearFlashes } = useFlash();

	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [query, setQuery] = useState("");
	const [selectedPlugin, setSelectedPlugin] = useState<ModrinthPlugin | null>(
		null,
	);
	const [isInstalling, setIsInstalling] = useState(false);

	// Global session state for smart auto-fill
	const [lastLoader, setLastLoader] = useState("");
	const [lastMcVersion, setLastMcVersion] = useState("");

	const { data, error, isValidating } = useGetModrinthPlugins(query, page);

	const topRef = useRef<HTMLDivElement>(null);

	const handleSearch = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		setPage(1);
		setQuery(search);
	};

	useEffect(() => {
		if (topRef.current) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, []);

	const onInstall = (version: ModrinthVersion) => {
		const file = version.files.find((f) => f.primary) || version.files[0];
		if (!file) {
			addFlash({
				type: "error",
				key: "modrinth:install",
				message: "Could not find a valid download for this version.",
			});
			return;
		}

		setIsInstalling(true);
		clearFlashes("modrinth:install");

		installPlugin(uuid, file.url)
			.then((duplicateName) => {
				addFlash({
					type: "success",
					key: "modrinth:install",
					message: `${selectedPlugin?.title} (${version.version_number}) has been queued for installation in your /plugins folder.`,
				});

				if (duplicateName) {
					addFlash({
						type: "warning",
						key: "modrinth:install",
						message: `Don't forget to delete duplicate plugin: ${duplicateName}`,
					});
				}

				setSelectedPlugin(null);
			})
			.catch((error) => {
				console.error(error);
				clearAndAddHttpError({ key: "modrinth:install", error });
			})
			.finally(() => setIsInstalling(false));
	};

	return (
		<ServerContentBlock title={"Plugin Installer"}>
			<div ref={topRef} />
			<div
				css={tw`flex flex-col md:flex-row items-center justify-between mb-8 gap-4`}
			>
				<div css={tw`flex items-center`}>
					<Puzzle size={24} css={tw`text-cyan-400 mr-2`} />
					<div>
						<h1 css={tw`text-2xl font-header font-medium`}>Modrinth Plugins</h1>
						<p css={tw`text-sm text-neutral-500`}>
							Find and install plugins directly from Modrinth.
						</p>
					</div>
				</div>

				<form onSubmit={handleSearch} css={tw`flex w-full md:w-auto gap-2`}>
					<Input
						placeholder={"Search plugins..."}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						css={tw`md:w-64`}
					/>
					<Button type={"submit"} color={"primary"} isLoading={isValidating}>
						<Search size={18} />
					</Button>
				</form>
			</div>

			<FlashMessageRender byKey={"modrinth:install"} css={tw`mb-6`} />

			{!data && isValidating ? (
				<div css={tw`py-24 flex flex-col items-center justify-center`}>
					<Spinner size={"large"} />
					<p
						css={tw`mt-4 text-neutral-500 animate-pulse uppercase tracking-widest text-xs`}
					>
						Searching Modrinth...
					</p>
				</div>
			) : error ? (
				<div
					css={tw`py-24 text-center bg-red-500/5 border border-red-500/20 rounded-xl`}
				>
					<p css={tw`text-red-400`}>
						An error occurred while fetching plugins from Modrinth.
					</p>
					<Button
						onClick={() => handleSearch()}
						css={tw`mt-4`}
						isSecondary
						color={"red"}
					>
						Retry Search
					</Button>
				</div>
			) : data && data.hits.length > 0 ? (
				<Pagination
					data={{
						items: data.hits,
						pagination: {
							total: data.total_hits,
							count: data.hits.length,
							perPage: data.limit,
							currentPage: page,
							totalPages: Math.ceil(data.total_hits / data.limit),
						},
					}}
					onPageSelect={setPage}
				>
					{({ items }) => (
						<div css={tw`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4`}>
							{items.map((plugin) => (
								<PluginCard
									key={plugin.project_id}
									plugin={plugin}
									onSelect={setSelectedPlugin}
								/>
							))}
						</div>
					)}
				</Pagination>
			) : (
				<div
					css={tw`py-24 text-center bg-neutral-800/20 border border-neutral-800 rounded-xl`}
				>
					<p css={tw`text-neutral-500`}>
						No plugins found matching your search.
					</p>
				</div>
			)}

			<VersionModal
				plugin={selectedPlugin}
				visible={!!selectedPlugin}
				onDismissed={() => !isInstalling && setSelectedPlugin(null)}
				onInstall={onInstall}
				lastLoader={lastLoader}
				lastMcVersion={lastMcVersion}
				setLastLoader={setLastLoader}
				setLastMcVersion={setLastMcVersion}
			/>
		</ServerContentBlock>
	);
};

export default ModrinthContainer;
