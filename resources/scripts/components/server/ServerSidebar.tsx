import {
	Activity,
	Archive,
	CalendarDays,
	Database,
	FileText,
	GanttChartSquare,
	Menu,
	Network,
	Play,
	Puzzle,
	Settings,
	Terminal,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";
import Can from "@/components/elements/Can";
import routes from "@/routers/routes";
import { useStoreState } from "@/state/hooks";
import { ServerContext } from "@/state/server";

const SidebarContainer = styled.div<{ $open: boolean }>`
	${tw`flex flex-col w-full md:w-60 flex-shrink-0 bg-white/[0.02] border-r border-white/5 md:min-h-[calc(100vh-3.5rem)] md:sticky md:top-14 md:self-start transition-all duration-300 ease-in-out overflow-hidden`};
    ${({ $open }) => ($open ? tw`max-h-[1000px]` : tw`max-h-12 md:max-h-none`)};
`;

const NavItem = styled(NavLink)`
    ${tw`flex items-center px-6 py-3 text-neutral-400 no-underline transition-colors duration-150 hover:text-neutral-100 hover:bg-white/5 border-l-4 border-transparent`};

    &.active {
        ${tw`text-cyan-400 bg-white/[0.08] border-cyan-500 font-medium`};
    }

    & svg {
        ${tw`mr-3 opacity-75 transition-opacity duration-150`};
    }

    &:hover svg, &.active svg {
        ${tw`opacity-100`};
    }
`;

const AdminNavItem = styled.a`
    ${tw`flex items-center px-6 py-3 text-red-400 no-underline transition-colors duration-150 hover:text-red-300 hover:bg-red-500/5 border-l-4 border-transparent`};

    & svg {
        ${tw`mr-3 opacity-75 transition-opacity duration-150`};
    }

    &:hover svg {
        ${tw`opacity-100`};
    }
`;

export default () => {
	const { id } = useParams<{ id: string }>();
	const [isOpen, setIsOpen] = useState(false);
	const internalId = ServerContext.useStoreState(
		(state) => state.server.data?.internalId,
	);
	const isRootAdmin = useStoreState((state) => state.user.data?.rootAdmin);

	const to = (value: string) => {
		const baseUrl = `/server/${id}`;
		if (value === "/") {
			return baseUrl;
		}
		return `${baseUrl}/${value.replace(/^\/+/, "")}`;
	};

	return (
		<SidebarContainer $open={isOpen}>
			<button
				type={"button"}
				onClick={() => setIsOpen(!isOpen)}
				css={tw`flex items-center justify-between px-6 py-3 md:hidden text-neutral-300 hover:text-white transition-colors duration-150 border-b border-white/5`}
			>
				<span css={tw`text-sm font-medium uppercase tracking-wider`}>Menu</span>
				{isOpen ? <X size={20} /> : <Menu size={20} />}
			</button>

			<div css={tw`py-4 space-y-1`} onClick={() => setIsOpen(false)}>
				{routes.server
					.filter((route) => !!route.name)
					.map((route) =>
						route.permission ? (
							<Can key={route.path} action={route.permission} matchAny>
								<NavItem to={to(route.path)} end={route.exact}>
									{/* Icon Mapping based on route name */}
									{route.name === "Console" && <Terminal size={18} />}
									{route.name === "Files" && <FileText size={18} />}
									{route.name === "Plugins" && <Puzzle size={18} />}
									{route.name === "Databases" && <Database size={18} />}
									{route.name === "Schedules" && <CalendarDays size={18} />}
									{route.name === "Users" && <Users size={18} />}
									{route.name === "Backups" && <Archive size={18} />}
									{route.name === "Network" && <Network size={18} />}
									{route.name === "Startup" && <Play size={18} />}
									{route.name === "Settings" && <Settings size={18} />}
									{route.name === "Activity" && <Activity size={18} />}
									{route.name}
								</NavItem>
							</Can>
						) : (
							<NavItem key={route.path} to={to(route.path)} end={route.exact}>
								{route.name === "Console" && <Terminal size={18} />}
								{route.name === "Files" && <FileText size={18} />}
								{route.name === "Plugins" && <Puzzle size={18} />}
								{route.name === "Databases" && <Database size={18} />}
								{route.name === "Schedules" && <CalendarDays size={18} />}
								{route.name === "Users" && <Users size={18} />}
								{route.name === "Backups" && <Archive size={18} />}
								{route.name === "Network" && <Network size={18} />}
								{route.name === "Startup" && <Play size={18} />}
								{route.name === "Settings" && <Settings size={18} />}
								{route.name === "Activity" && <Activity size={18} />}
								{route.name}
							</NavItem>
						),
					)}
				{isRootAdmin && internalId && (
					<AdminNavItem href={`/admin/servers/view/${internalId}`}>
						<GanttChartSquare size={18} />
						Admin View
					</AdminNavItem>
				)}
			</div>
		</SidebarContainer>
	);
};
