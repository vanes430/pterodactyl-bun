import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import copy from "copy-to-clipboard";
import {
	Ban,
	Cpu,
	GripVertical,
	HardDrive,
	MemoryStick,
	Network,
	ServerCog,
	Server as ServerIcon,
	ServerOff,
} from "lucide-react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";
import type { Server } from "@/api/server/getServer";
import getServerResourceUsage, {
	type ServerPowerState,
	type ServerStats,
} from "@/api/server/getServerResourceUsage";
import GreyRowBox from "@/components/elements/GreyRowBox";
import Spinner from "@/components/elements/Spinner";
import { bytesToString, ip, mbToBytes } from "@/lib/formatters";

const isAlarmState = (current: number, limit: number): boolean =>
	limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const IconWrapper = memo(
	styled.div<{ $alarm: boolean }>`
        ${(props) => (props.$alarm ? tw`text-red-400` : tw`text-neutral-500`)};
    ` as React.FC<React.PropsWithChildren<{ $alarm: boolean }>>,
	isEqual,
);

const IconDescription = styled.p<{ $alarm: boolean }>`
    ${tw`text-sm ml-2`};
    ${(props) => (props.$alarm ? tw`text-white` : tw`text-neutral-400`)};
`;

const StatusIndicatorBox = styled(GreyRowBox)<{
	$status: ServerPowerState | undefined;
}>`
    ${tw`grid grid-cols-12 gap-4 relative transition-all duration-300 ease-out`};
    ${tw`bg-white/[0.03]  border border-white/[0.05] hover:border-white/10`};
    ${tw`hover:shadow-2xl hover:bg-white/[0.06] hover:-translate-y-1 hover:scale-[1.01]`};

    & .status-bar {
        ${tw`w-1 bg-red-500 absolute left-0 top-0 bottom-0 z-20 rounded-full my-2 ml-1 opacity-80 transition-all duration-150`};

        ${({ $status }) =>
					!$status || $status === "offline"
						? tw`bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]`
						: $status === "running"
							? tw`bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]`
							: tw`bg-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.8)]`};
    }
`;

type Timer = ReturnType<typeof setInterval>;

const ServerRowContent = memo(
	({
		server,
		className,
		isDragging,
		listeners,
		attributes,
	}: {
		server: Server;
		className?: string;
		isDragging?: boolean;
		listeners?: any;
		attributes?: any;
	}) => {
		const navigate = useNavigate();
		const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
		const [isSuspended, setIsSuspended] = useState(
			server.status === "suspended",
		);
		const [stats, setStats] = useState<ServerStats | null>(null);
		const [failCount, setFailCount] = useState(0);
		const [isGracefulOffline, setIsGracefulOffline] = useState(false);

		const getStats = useCallback(
			() =>
				getServerResourceUsage(server.uuid)
					.then((data) => {
						setStats(data);
						setFailCount(0);
						setIsGracefulOffline(false);
					})
					.catch(() => {
						setFailCount((prev) => {
							if (prev >= 1) {
								setIsGracefulOffline(true);
								return 2;
							}
							return prev + 1;
						});
					}),
			[server.uuid],
		);

		useEffect(() => {
			setIsSuspended(stats?.isSuspended || server.status === "suspended");
		}, [stats?.isSuspended, server.status]);

		useEffect(() => {
			if (
				isSuspended ||
				server.status !== null ||
				server.isTransferring ||
				isGracefulOffline
			)
				return;

			// Initial call
			getStats();

			// Set interval based on current success state
			// If we have failed once, retry in 5s. Otherwise, standard 30s.
			const delay = failCount > 0 ? 5000 : 30000;
			interval.current = setInterval(() => getStats(), delay);

			return () => {
				interval.current && clearInterval(interval.current);
			};
		}, [
			isSuspended,
			server.status,
			server.isTransferring,
			isGracefulOffline,
			failCount,
			getStats,
		]);

		const alarms = { cpu: false, memory: false, disk: false };
		if (stats) {
			alarms.cpu =
				server.limits.cpu === 0
					? false
					: stats.cpuUsagePercent >= server.limits.cpu * 0.9;
			alarms.memory = isAlarmState(
				stats.memoryUsageInBytes,
				server.limits.memory,
			);
			alarms.disk =
				server.limits.disk === 0
					? false
					: isAlarmState(stats.diskUsageInBytes, server.limits.disk);
		}

		const diskLimit =
			server.limits.disk !== 0
				? bytesToString(mbToBytes(server.limits.disk))
				: "Unlimited";
		const memoryLimit =
			server.limits.memory !== 0
				? bytesToString(mbToBytes(server.limits.memory))
				: "Unlimited";
		const cpuLimit =
			server.limits.cpu !== 0 ? `${server.limits.cpu} %` : "Unlimited";

		const onCopyIP = (e: React.MouseEvent, text: string) => {
			e.preventDefault();
			e.stopPropagation();
			copy(text);
			toast.success("IP copied to clipboard");
		};

		const handleRowClick = (e: React.MouseEvent) => {
			if ((e.target as HTMLElement).closest(".drag-handle") || isDragging)
				return;
			navigate(`/server/${server.id}`);
		};

		return (
			<StatusIndicatorBox
				as={"div"}
				onClick={handleRowClick}
				className={className}
				$status={stats?.status}
				css={[tw`cursor-pointer`, isDragging && tw`opacity-50`]}
			>
				<div
					css={tw`flex items-center col-span-12 sm:col-span-5 lg:col-span-6`}
				>
					<div
						{...attributes}
						{...listeners}
						className={"drag-handle"}
						css={tw`mr-4 text-neutral-600 hover:text-neutral-400 cursor-grab active:cursor-grabbing p-1 -ml-2 transition-colors duration-75`}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
					>
						<GripVertical size={20} />
					</div>
					<div className={"icon mr-4 text-neutral-500"}>
						{isSuspended ? (
							<div css={tw`relative flex items-center justify-center`}>
								<ServerIcon size={24} />
								<div
									css={tw`absolute inset-0 flex items-center justify-center opacity-90`}
								>
									<Ban size={18} css={tw`text-red-500 stroke-[3px]`} />
								</div>
							</div>
						) : server.status === "installing" || server.isTransferring ? (
							<ServerCog size={24} css={tw`animate-spin-slow`} />
						) : !stats || stats.status === "offline" || isGracefulOffline ? (
							<ServerOff size={24} />
						) : stats.status === "starting" ? (
							<ServerCog size={24} />
						) : (
							<ServerIcon size={24} />
						)}
					</div>
					<div>
						<p css={tw`text-lg break-words text-neutral-100`}>{server.name}</p>
						{!!server.description && (
							<p css={tw`text-sm text-neutral-400 break-words line-clamp-2`}>
								{server.description}
							</p>
						)}
					</div>
				</div>
				<div css={tw`flex-1 ml-4 lg:block lg:col-span-2 hidden`}>
					<div css={tw`flex justify-center items-center`}>
						<Network size={16} css={tw`text-neutral-500`} />
						<p
							css={tw`text-sm text-neutral-400 ml-2 hover:text-neutral-100 cursor-pointer transition-colors duration-75`}
							onClick={(e) => {
								const alloc = server.allocations.find((a) => a.isDefault);
								if (alloc)
									onCopyIP(e, `${alloc.alias || ip(alloc.ip)}:${alloc.port}`);
							}}
						>
							{server.allocations
								.filter((alloc) => alloc.isDefault)
								.map((allocation) => (
									<React.Fragment
										key={allocation.ip + allocation.port.toString()}
									>
										{allocation.alias || ip(allocation.ip)}:{allocation.port}
									</React.Fragment>
								))}
						</p>
					</div>
				</div>
				<div
					css={tw`hidden col-span-7 lg:col-span-4 sm:flex items-baseline justify-center`}
				>
					{!stats || isSuspended || isGracefulOffline ? (
						<div css={tw`flex-1 text-center`}>
							<span css={tw`bg-red-500 rounded px-2 py-1 text-red-100 text-xs`}>
								{isSuspended
									? server.status === "suspended"
										? "Suspended"
										: "Connection Error"
									: isGracefulOffline
										? "Down..?"
										: "Loading..."}
							</span>
						</div>
					) : (
						<React.Fragment>
							<div css={tw`flex-1 ml-4 sm:block hidden`}>
								<div css={tw`flex justify-center items-center`}>
									<IconWrapper $alarm={alarms.cpu}>
										<Cpu size={16} />
									</IconWrapper>
									<IconDescription $alarm={alarms.cpu}>
										{stats.cpuUsagePercent.toFixed(2)} %
									</IconDescription>
								</div>
								<p css={tw`text-xs text-neutral-600 text-center mt-1`}>
									of {cpuLimit}
								</p>
							</div>
							<div css={tw`flex-1 ml-4 sm:block hidden`}>
								<div css={tw`flex justify-center items-center`}>
									<IconWrapper $alarm={alarms.memory}>
										<MemoryStick size={16} />
									</IconWrapper>
									<IconDescription $alarm={alarms.memory}>
										{bytesToString(stats.memoryUsageInBytes)}
									</IconDescription>
								</div>
								<p css={tw`text-xs text-neutral-600 text-center mt-1`}>
									of {memoryLimit}
								</p>
							</div>
							<div css={tw`flex-1 ml-4 sm:block hidden`}>
								<div css={tw`flex justify-center items-center`}>
									<IconWrapper $alarm={alarms.disk}>
										<HardDrive size={16} />
									</IconWrapper>
									<IconDescription $alarm={alarms.disk}>
										{bytesToString(stats.diskUsageInBytes)}
									</IconDescription>
								</div>
								<p css={tw`text-xs text-neutral-600 text-center mt-1`}>
									of {diskLimit}
								</p>
							</div>
						</React.Fragment>
					)}
				</div>
				<div className={"status-bar"} />
			</StatusIndicatorBox>
		);
	},
	isEqual,
);

export { ServerRowContent };

export default ({
	server,
	className,
}: {
	server: Server;
	className?: string;
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: server.uuid });

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	return (
		<div ref={setNodeRef} style={style}>
			<ServerRowContent
				server={server}
				className={className}
				isDragging={isDragging}
				listeners={listeners}
				attributes={attributes}
			/>
		</div>
	);
};
