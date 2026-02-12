import Features from "@feature/Features";
import { lazy, memo, useEffect, useState } from "react";
import isEqual from "react-fast-compare";
import tw from "twin.macro";
import { Alert } from "@/components/elements/alert";
import Can from "@/components/elements/Can";
import ServerContentBlock from "@/components/elements/ServerContentBlock";
import Spinner from "@/components/elements/Spinner";
import Console from "@/components/server/console/Console";
import McLogsButton from "@/components/server/console/McLogsButton";
import PowerButtons from "@/components/server/console/PowerButtons";
import ServerDetailsBlock from "@/components/server/console/ServerDetailsBlock";
import { ServerContext } from "@/state/server";

const StatGraphs = lazy(() => import("@/components/server/console/StatGraphs"));

const ServerConsoleContainer = () => {
	const [showExtras, setShowExtras] = useState(false);
	const name = ServerContext.useStoreState((state) => state.server.data?.name);
	const description = ServerContext.useStoreState(
		(state) => state.server.data?.description,
	);
	const isInstalling = ServerContext.useStoreState(
		(state) => state.server.isInstalling,
	);
	const isTransferring = ServerContext.useStoreState(
		(state) => state.server.data?.isTransferring,
	);
	const eggFeatures = ServerContext.useStoreState(
		(state) => state.server.data?.eggFeatures,
		isEqual,
	);
	const isNodeUnderMaintenance = ServerContext.useStoreState(
		(state) => state.server.data?.isNodeUnderMaintenance,
	);

	useEffect(() => {
		// Berikan prioritas pada Console untuk render pertama kali,
		// lalu tampilkan komponen lainnya setelah jeda singkat yang lebih lama untuk TBT.
		const timeout = setTimeout(() => setShowExtras(true), 500);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<ServerContentBlock title={"Console"}>
			{(isNodeUnderMaintenance || isInstalling || isTransferring) && (
				<Alert type={"warning"} className={"mb-4"}>
					{isNodeUnderMaintenance
						? "The node of this server is currently under maintenance and all actions are unavailable."
						: isInstalling
							? "This server is currently running its installation process and most actions are unavailable."
							: "This server is currently being transferred to another node and all actions are unavailable."}
				</Alert>
			)}
			<div className={"flex flex-col sm:grid sm:grid-cols-4 gap-4 mb-4"}>
				<div className={"sm:col-span-2 lg:col-span-3 pr-4"}>
					<div css={tw`flex items-center justify-center sm:justify-start`}>
						<h1
							className={
								"font-header font-medium text-2xl text-gray-50 leading-relaxed line-clamp-1"
							}
						>
							{name}
						</h1>
						<McLogsButton />
					</div>
					<p className={"text-sm line-clamp-2 text-center sm:text-left"}>
						{description}
					</p>
				</div>
				<div
					className={
						"sm:col-span-2 lg:col-span-1 self-end mt-4 sm:mt-0 w-full sm:w-auto"
					}
				>
					<Can
						action={["control.start", "control.stop", "control.restart"]}
						matchAny
					>
						<PowerButtons
							className={
								"flex justify-center sm:justify-end space-x-2 w-full sm:w-auto"
							}
						/>
					</Can>
				</div>
			</div>
			<div className={"grid grid-cols-4 gap-2 sm:gap-4 mb-4"}>
				<div className={"flex col-span-4 lg:col-span-3 min-w-0"}>
					<Console />
				</div>
				<div
					className={
						"col-span-4 lg:col-span-1 order-last lg:order-none min-w-0"
					}
				>
					{showExtras ? (
						<ServerDetailsBlock />
					) : (
						<div
							className={
								"grid grid-cols-12 gap-2 md:gap-4 min-h-[480px] lg:min-h-0"
							}
						>
							{[...Array(7)].map((_, i) => (
								<div
									key={i}
									className={
										"col-span-6 md:col-span-4 lg:col-span-12 h-20 bg-gray-800/20 rounded-lg animate-pulse"
									}
								/>
							))}
						</div>
					)}
				</div>
			</div>
			<div className={"grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4"}>
				{showExtras ? (
					<Spinner.Suspense>
						<StatGraphs />
					</Spinner.Suspense>
				) : (
					[...Array(3)].map((_, i) => (
						<div
							key={i}
							className={"h-[210px] bg-gray-800/20 rounded-lg animate-pulse"}
						/>
					))
				)}
			</div>
			{showExtras && <Features enabled={eggFeatures} />}
		</ServerContentBlock>
	);
};

export default memo(ServerConsoleContainer, isEqual);
