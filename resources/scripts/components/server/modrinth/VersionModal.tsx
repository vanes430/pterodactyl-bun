import {
	AlertCircle,
	CheckCircle,
	ChevronRight,
	Cpu,
	ExternalLink,
	HardDrive,
	Package,
	RefreshCw,
	Settings2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import tw from "twin.macro";
import type {
	ModrinthPlugin,
	ModrinthVersion,
} from "@/api/server/modrinth/types";
import { useGetModrinthTags } from "@/api/server/modrinth/useGetModrinthTags";
import { useGetModrinthVersions } from "@/api/server/modrinth/useGetModrinthVersions";
import Button from "@/components/elements/Button";
import Modal from "@/components/elements/Modal";
import Select from "@/components/elements/Select";
import Spinner from "@/components/elements/Spinner";

interface Props {
	plugin: ModrinthPlugin | null;
	visible: boolean;
	onDismissed: () => void;
	onInstall: (version: ModrinthVersion) => void;
	// Session memory props
	lastLoader: string;
	lastMcVersion: string;
	setLastLoader: (v: string) => void;
	setLastMcVersion: (v: string) => void;
}

const VersionModal = ({
	plugin,
	visible,
	onDismissed,
	onInstall,
	lastLoader,
	lastMcVersion,
	setLastLoader,
	setLastMcVersion,
}: Props) => {
	const { data: versions, error: versionsError } = useGetModrinthVersions(
		plugin?.project_id || null,
	);
	const { gameVersions } = useGetModrinthTags();

	const [selectedLoader, setSelectedLoader] = useState("");
	const [selectedMcVersion, setSelectedMcVersion] = useState("");
	const [showAll, setShowAll] = useState(false);

	const { availableLoaders, availableMcVersions } = useMemo(() => {
		if (!versions || !gameVersions.length)
			return { availableLoaders: [], availableMcVersions: [] };

		const loaders = new Set<string>();
		const mcVersions = new Set<string>();
		const serverLoaders = [
			"paper",
			"spigot",
			"bukkit",
			"velocity",
			"folia",
			"bungeecord",
			"purpur",
			"waterfall",
		];
		const validMcVersions = gameVersions.map((gv) => gv.version);

		versions.forEach((v) => {
			v.loaders.forEach((l) => {
				if (serverLoaders.includes(l.toLowerCase()))
					loaders.add(l.toLowerCase());
			});
			v.game_versions.forEach((gv) => {
				if (validMcVersions.includes(gv)) mcVersions.add(gv);
			});
		});

		return {
			availableLoaders: Array.from(loaders).sort(),
			availableMcVersions: Array.from(mcVersions).sort((a, b) =>
				b.localeCompare(a, undefined, { numeric: true }),
			),
		};
	}, [versions, gameVersions]);

	// Session Memory Logic: Auto-fill when modal opens
	useEffect(() => {
		if (
			visible &&
			availableLoaders.length > 0 &&
			availableMcVersions.length > 0
		) {
			// Check if last selection is still valid for THIS plugin
			const isLoaderValid = availableLoaders.includes(lastLoader);
			const isVersionValid = availableMcVersions.includes(lastMcVersion);

			setSelectedLoader(
				isLoaderValid
					? lastLoader
					: availableLoaders.length === 1
						? availableLoaders[0]
						: "",
			);
			setSelectedMcVersion(
				isVersionValid
					? lastMcVersion
					: availableMcVersions.length === 1
						? availableMcVersions[0]
						: "",
			);
			setShowAll(false);
		}
	}, [
		visible,
		availableLoaders,
		availableMcVersions,
		lastLoader,
		lastMcVersion,
	]);

	const filteredVersions = useMemo(() => {
		if (!versions || !selectedLoader || !selectedMcVersion) return [];
		return versions.filter(
			(v) =>
				v.loaders.includes(selectedLoader) &&
				v.game_versions.includes(selectedMcVersion),
		);
	}, [versions, selectedLoader, selectedMcVersion]);

	const recommendedVersions = useMemo(() => {
		if (filteredVersions.length === 0) return [];
		const types = ["alpha", "beta", "release"];
		const picked: ModrinthVersion[] = [];

		types.forEach((t) => {
			const found = filteredVersions.find((v) => v.version_type === t);
			if (found) picked.push(found);
		});

		return picked;
	}, [filteredVersions]);

	const updateLoader = (v: string) => {
		setSelectedLoader(v);
		setLastLoader(v);
		setShowAll(false);
	};

	const updateMcVersion = (v: string) => {
		setSelectedMcVersion(v);
		setLastMcVersion(v);
		setShowAll(false);
	};

	return (
		<Modal
			visible={visible}
			onDismissed={() => {
				setShowAll(false);
				onDismissed();
			}}
			top={false}
		>
			<div css={tw`flex items-center justify-between mb-6 mr-8`}>
				<div css={tw`flex items-center overflow-hidden`}>
					<Package size={24} css={tw`text-cyan-400 mr-2 flex-shrink-0`} />
					<h2 css={tw`text-xl font-header truncate`}>
						Install {plugin?.title}
					</h2>
				</div>
				{plugin && (
					<a
						href={`https://modrinth.com/plugin/${plugin.project_id}`}
						target={"_blank"}
						rel={"noreferrer"}
						css={tw`hidden sm:flex items-center text-[10px] text-neutral-500 hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700`}
					>
						<ExternalLink size={12} css={tw`mr-1.5`} /> Modrinth
					</a>
				)}
			</div>

			{!versions && !versionsError ? (
				<div css={tw`py-12 flex flex-col items-center`}>
					<Spinner size={"large"} />
					<p
						css={tw`mt-4 text-sm text-neutral-400 animate-pulse uppercase tracking-wider text-[10px]`}
					>
						Analyzing compatibility...
					</p>
				</div>
			) : versionsError ? (
				<div css={tw`py-12 text-center`}>
					<AlertCircle size={40} css={tw`text-red-400 mx-auto mb-4`} />
					<p css={tw`text-red-400`}>Failed to connect to Modrinth API.</p>
					<Button onClick={() => onDismissed()} css={tw`mt-4`} isSecondary>
						Close
					</Button>
				</div>
			) : (
				<div css={tw`space-y-6`}>
					<div css={tw`grid grid-cols-1 md:grid-cols-2 gap-4`}>
						<div
							css={tw`p-3 bg-neutral-800/50 rounded-xl border border-neutral-700`}
						>
							<label
								css={tw`flex items-center text-[10px] uppercase text-neutral-500 font-bold mb-1.5`}
							>
								<Cpu size={12} css={tw`mr-1`} /> Software
							</label>
							<Select
								value={selectedLoader}
								onChange={(e) => updateLoader(e.target.value)}
							>
								<option value="" disabled>
									Select Software
								</option>
								{availableLoaders.map((l) => (
									<option key={l} value={l}>
										{l.toUpperCase()}
									</option>
								))}
							</Select>
						</div>
						<div
							css={tw`p-3 bg-neutral-800/50 rounded-xl border border-neutral-700`}
						>
							<label
								css={tw`flex items-center text-[10px] uppercase text-neutral-500 font-bold mb-1.5`}
							>
								<HardDrive size={12} css={tw`mr-1`} /> Version
							</label>
							<Select
								value={selectedMcVersion}
								onChange={(e) => updateMcVersion(e.target.value)}
							>
								<option value="" disabled>
									Select MC Version
								</option>
								{availableMcVersions.map((v) => (
									<option key={v} value={v}>
										{v}
									</option>
								))}
							</Select>
						</div>
					</div>

					<div css={tw`mt-4`}>
						{!selectedLoader || !selectedMcVersion ? (
							<div
								css={tw`py-8 text-center border border-dashed border-neutral-800 rounded-2xl`}
							>
								<p
									css={tw`text-neutral-600 text-xs italic uppercase tracking-wider`}
								>
									Select your server environment above.
								</p>
							</div>
						) : !showAll ? (
							recommendedVersions.length > 0 ? (
								<div css={tw`w-full`}>
									<div
										css={[
											tw`grid gap-3 mb-4`,
											recommendedVersions.length === 1
												? tw`grid-cols-1`
												: recommendedVersions.length === 2
													? tw`grid-cols-2`
													: tw`grid-cols-1 sm:grid-cols-3`,
										]}
									>
										{recommendedVersions.map((v) => (
											<div
												key={v.id}
												css={[
													tw`border-t-4 p-4 rounded-b-xl bg-neutral-800/30 flex flex-col items-center text-center`,
													v.version_type === "release"
														? tw`border-green-500 bg-green-500/5`
														: v.version_type === "beta"
															? tw`border-yellow-500 bg-yellow-500/5`
															: tw`border-red-500 bg-red-500/5`,
												]}
											>
												<div
													css={[
														tw`text-[9px] font-bold uppercase tracking-widest mb-2`,
														v.version_type === "release"
															? tw`text-green-400`
															: v.version_type === "beta"
																? tw`text-yellow-400`
																: tw`text-red-400`,
													]}
												>
													{v.version_type}
												</div>

												<h3
													css={tw`text-sm font-bold text-neutral-100 truncate w-full mb-1`}
												>
													{v.name}
												</h3>
												<p
													css={tw`text-[10px] text-neutral-500 mb-4 font-mono truncate w-full`}
												>
													v{v.version_number}
												</p>

												<Button
													color={
														v.version_type === "release" ? "green" : "grey"
													}
													size={"small"}
													css={tw`w-full`}
													onClick={() => onInstall(v)}
												>
													<div css={tw`flex items-center justify-center`}>
														<CheckCircle size={14} css={tw`mr-1.5`} /> Install
													</div>
												</Button>
											</div>
										))}
									</div>
									<button
										onClick={() => setShowAll(true)}
										css={tw`w-full py-2 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors uppercase font-bold tracking-widest flex items-center justify-center`}
									>
										Other versions ({filteredVersions.length}){" "}
										<ChevronRight size={12} css={tw`ml-1`} />
									</button>
								</div>
							) : (
								<div
									css={tw`text-center py-10 bg-red-500/5 rounded-2xl border border-red-500/20`}
								>
									<Settings2 size={32} css={tw`text-red-400/50 mx-auto mb-3`} />
									<p css={tw`text-neutral-400 text-sm`}>
										No version found for{" "}
										<strong>
											{selectedLoader.toUpperCase()} {selectedMcVersion}
										</strong>
										.
									</p>
								</div>
							)
						) : (
							<div css={tw`space-y-2 max-h-[300px] overflow-y-auto pr-2`}>
								<div
									css={tw`flex items-center justify-between mb-2 sticky top-0 bg-neutral-900 py-1 z-10`}
								>
									<p css={tw`text-xs text-neutral-500 uppercase font-bold`}>
										All Compatible ({filteredVersions.length})
									</p>
									<button
										onClick={() => setShowAll(false)}
										css={tw`text-xs text-cyan-400 flex items-center font-bold uppercase`}
									>
										<RefreshCw size={12} css={tw`mr-1`} /> Back
									</button>
								</div>
								{filteredVersions.map((v) => (
									<div
										key={v.id}
										css={tw`bg-neutral-800/40 border border-neutral-700 p-3 rounded-lg flex justify-between items-center hover:border-neutral-600 transition-colors`}
									>
										<div css={tw`mr-4 overflow-hidden`}>
											<p css={tw`font-bold text-xs text-neutral-200 truncate`}>
												{v.name}
											</p>
											<p
												css={tw`text-[9px] text-neutral-500 font-mono mt-0.5 uppercase`}
											>
												{v.version_number} • {v.version_type}
											</p>
										</div>
										<Button
											size={"xsmall"}
											color={"green"}
											onClick={() => onInstall(v)}
										>
											Install
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</Modal>
	);
};

export default VersionModal;
