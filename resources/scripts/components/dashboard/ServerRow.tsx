import copy from "copy-to-clipboard";
import {
	Cpu,
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
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import tw from "twin.macro";
import type { Server } from "@/api/server/getServer";
import getServerResourceUsage, {
	type ServerPowerState,
	type ServerStats,
} from "@/api/server/getServerResourceUsage";
import GreyRowBox from "@/components/elements/GreyRowBox";
import Spinner from "@/components/elements/Spinner";
import { bytesToString, ip, mbToBytes } from "@/lib/formatters";

// Determines if the current value is in an alarm threshold so we can show it in red rather
// than the more faded default style.
const isAlarmState = (current: number, limit: number): boolean =>
	limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const IconWrapper = memo(
	styled.div<{ $alarm: boolean }>`
        ${(props) => (props.$alarm ? tw`text-red-400` : tw`text-neutral-500`)};
    `,
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

export default ({
	server,
	className,
}: {
	server: Server;
	className?: string;
}) => {
	const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
	const [isSuspended, setIsSuspended] = useState(server.status === "suspended");
	const [stats, setStats] = useState<ServerStats | null>(null);

	const getStats = useCallback(
		() =>
			getServerResourceUsage(server.uuid)
				.then((data) => setStats(data))
				.catch((error) => console.error(error)),
		[server.uuid],
	);

	useEffect(() => {
		setIsSuspended(stats?.isSuspended || server.status === "suspended");
	}, [stats?.isSuspended, server.status]);

	useEffect(() => {
		// Don't waste a HTTP request if there is nothing important to show to the user because
		// the server is suspended.
		if (isSuspended) return;

		getStats().then(() => {
			interval.current = setInterval(() => getStats(), 30000);
		});

		return () => {
			interval.current && clearInterval(interval.current);
		};
	}, [isSuspended, getStats]);

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
		toast.success("IP address copied to clipboard!");
	};

	return (
		<StatusIndicatorBox
			as={Link}
			to={`/server/${server.id}`}
			className={className}
			$status={stats?.status}
		>
			<div css={tw`flex items-center col-span-12 sm:col-span-5 lg:col-span-6`}>
				<div className={"icon mr-4 text-neutral-500"}>
					{!stats || stats.status === "offline" ? (
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
				{!stats || isSuspended ? (
					isSuspended ? (
						<div css={tw`flex-1 text-center`}>
							<span css={tw`bg-red-500 rounded px-2 py-1 text-red-100 text-xs`}>
								{server.status === "suspended"
									? "Suspended"
									: "Connection Error"}
							</span>
						</div>
					) : server.isTransferring || server.status ? (
						<div css={tw`flex-1 text-center`}>
							<span
								css={tw`bg-neutral-500 rounded px-2 py-1 text-neutral-100 text-xs`}
							>
								{server.isTransferring
									? "Transferring"
									: server.status === "installing"
										? "Installing"
										: server.status === "restoring_backup"
											? "Restoring Backup"
											: "Unavailable"}
							</span>
						</div>
					) : (
						<Spinner size={"small"} />
					)
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
};
