import {
	Activity,
	Archive,
	CalendarDays,
	Database,
	FileText,
	GanttChartSquare,
	Network,
	Play,
	Settings,
	Terminal,
	Users,
} from "lucide-react";
import { NavLink, useRouteMatch } from "react-router-dom";
import styled from "styled-components/macro";
import tw from "twin.macro";
import Can from "@/components/elements/Can";
import routes from "@/routers/routes";
import { useStoreState } from "@/state/hooks";
import { ServerContext } from "@/state/server";

const SidebarContainer = styled.div`
	${tw`flex flex-col w-full md:w-60 flex-shrink-0 bg-white/[0.02] border-r border-white/5 md:min-h-[calc(100vh-3.5rem)] md:sticky md:top-14 md:self-start`};
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
	const match = useRouteMatch<{ id: string }>();
	const internalId = ServerContext.useStoreState(
		(state) => state.server.data?.internalId,
	);
	const isRootAdmin = useStoreState((state) => state.user.data?.rootAdmin);

	const to = (value: string, url = false) => {
		if (value === "/") {
			return url ? match.url : match.path;
		}
		return `${(url ? match.url : match.path).replace(/\/*$/, "")}/${value.replace(/^\/+/, "")}`;
	};

	return (
		<SidebarContainer>
			<div css={tw`py-4 space-y-1`}>
				{routes.server
					.filter((route) => !!route.name)
					.map((route) =>
						route.permission ? (
							<Can key={route.path} action={route.permission} matchAny>
								<NavItem to={to(route.path, true)} exact={route.exact}>
									{/* Icon Mapping based on route name */}
									{route.name === "Console" && <Terminal size={18} />}
									{route.name === "Files" && <FileText size={18} />}
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
							<NavItem
								key={route.path}
								to={to(route.path, true)}
								exact={route.exact}
							>
								{route.name === "Console" && <Terminal size={18} />}
								{route.name === "Files" && <FileText size={18} />}
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
