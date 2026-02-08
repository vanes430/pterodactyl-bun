import { useStoreState } from "easy-peasy";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import tw, { theme } from "twin.macro";
import http from "@/api/http";
import Avatar from "@/components/Avatar";
import SearchContainer from "@/components/dashboard/search/SearchContainer";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import Tooltip from "@/components/elements/tooltip/Tooltip";
import type { ApplicationStore } from "@/state";

const RightNavigation = styled.div`
    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center h-full no-underline text-neutral-400 px-3 md:px-6 cursor-pointer transition-colors duration-150`};

        &:active,
        &:hover {
            ${tw`text-neutral-100 bg-white/5`};
        }

        &.active {
            ${tw`text-cyan-400`};
            box-shadow: inset 0 -2px ${theme`colors.cyan.500`.toString()};
        }
    }
`;

export default () => {
	const name = useStoreState(
		(state: ApplicationStore) => state.settings.data?.name,
	);
	const rootAdmin = useStoreState(
		(state: ApplicationStore) => state.user.data?.rootAdmin,
	);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const onTriggerLogout = () => {
		setIsLoggingOut(true);
		http.post("/auth/logout").finally(() => {
			// @ts-expect-error this is valid
			window.location = "/";
		});
	};

	return (
		<div
			className={
				"w-full bg-neutral-900/90 backdrop-blur-md shadow-md sticky top-0 z-50"
			}
		>
			<SpinnerOverlay visible={isLoggingOut} />
			<div
				className={
					"mx-auto w-full flex items-center h-[3.5rem] max-w-[1200px] px-2"
				}
			>
				<div id={"logo"} className={"flex-shrink-0"}>
					<Link
						to={"/"}
						className={
							"text-lg md:text-2xl font-header font-medium px-2 md:px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150"
						}
					>
						{name}
					</Link>
				</div>
				<RightNavigation
					className={
						"flex-1 flex h-full items-center justify-end overflow-x-auto"
					}
				>
					<SearchContainer />
					<Tooltip placement={"bottom"} content={"Dashboard"}>
						<NavLink to={"/"} end>
							<LayoutDashboard size={20} strokeWidth={2} />
						</NavLink>
					</Tooltip>
					{rootAdmin && (
						<Tooltip placement={"bottom"} content={"Admin"}>
							<a href={"/admin"} rel={"noreferrer"}>
								<Settings size={20} strokeWidth={2} />
							</a>
						</Tooltip>
					)}
					<Tooltip placement={"bottom"} content={"Account Settings"}>
						<NavLink to={"/account"}>
							<span className={"flex items-center w-5 h-5"}>
								<Avatar.User />
							</span>
						</NavLink>
					</Tooltip>
					<Tooltip placement={"bottom"} content={"Sign Out"}>
						<button type={"button"} onClick={onTriggerLogout}>
							<LogOut size={20} strokeWidth={2} />
						</button>
					</Tooltip>
				</RightNavigation>
			</div>
		</div>
	);
};
