import { useStoreState } from "easy-peasy";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import tw from "twin.macro";
import getServers from "@/api/getServers";
import type { PaginatedResult } from "@/api/http";
import type { Server } from "@/api/server/getServer";
import ServerRow from "@/components/dashboard/ServerRow";
import PageContentBlock from "@/components/elements/PageContentBlock";
import Pagination from "@/components/elements/Pagination";
import Skeleton from "@/components/elements/Skeleton";
import Switch from "@/components/elements/Switch";
import useFlash from "@/plugins/useFlash";
import { usePersistedState } from "@/plugins/usePersistedState";

export default () => {
	const { search } = useLocation();
	const defaultPage = Number(new URLSearchParams(search).get("page") || "1");

	const [page, setPage] = useState(
		!Number.isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1,
	);
	const { clearFlashes, clearAndAddHttpError } = useFlash();
	const uuid = useStoreState((state) => state.user.data?.uuid);
	const rootAdmin = useStoreState((state) => state.user.data?.rootAdmin);
	const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(
		`${uuid}:show_all_servers`,
		false,
	);

	const { data: servers, error } = useSWR<PaginatedResult<Server>>(
		["/api/client/servers", showOnlyAdmin && rootAdmin, page],
		() =>
			getServers({
				page,
				type: showOnlyAdmin && rootAdmin ? "admin" : undefined,
			}),
	);

	useEffect(() => {
		if (!servers) return;
		if (servers.pagination.currentPage > 1 && !servers.items.length) {
			setPage(1);
		}
	}, [servers?.pagination.currentPage, servers]);

	useEffect(() => {
		// Don't use react-router to handle changing this part of the URL, otherwise it
		// triggers a needless re-render. We just want to track this in the URL incase the
		// user refreshes the page.
		window.history.replaceState(
			null,
			document.title,
			`/${page <= 1 ? "" : `?page=${page}`}`,
		);
	}, [page]);

	useEffect(() => {
		if (error) clearAndAddHttpError({ key: "dashboard", error });
		if (!error) clearFlashes("dashboard");
	}, [error, clearAndAddHttpError, clearFlashes]);

	return (
		<PageContentBlock title={"Dashboard"} showFlashKey={"dashboard"}>
			{rootAdmin && (
				<div css={tw`mb-2 flex justify-end items-center`}>
					<p css={tw`uppercase text-xs text-neutral-400 mr-2`}>
						{showOnlyAdmin ? "Showing others' servers" : "Showing your servers"}
					</p>
					<Switch
						name={"show_all_servers"}
						defaultChecked={showOnlyAdmin}
						onChange={() => setShowOnlyAdmin((s) => !s)}
					/>
				</div>
			)}
			{!servers ? (
				<div css={tw`space-y-2`}>
					{[...Array(5)].map((_, i) => (
						<div key={i} css={tw`bg-neutral-700/50 p-4 rounded-lg flex items-center`}>
							<Skeleton circle width={"40px"} height={"40px"} className={"mr-4"} />
							<div css={tw`flex-1`}>
								<Skeleton width={"30%"} height={"1.25rem"} className={"mb-2"} />
								<Skeleton width={"20%"} height={"0.75rem"} />
							</div>
							<div css={tw`hidden md:flex flex-col items-end mr-8`}>
								<Skeleton width={"60px"} height={"0.75rem"} className={"mb-2"} />
								<Skeleton width={"40px"} height={"0.75rem"} />
							</div>
							<Skeleton width={"100px"} height={"2rem"} />
						</div>
					))}
				</div>
			) : (
				<Pagination data={servers} onPageSelect={setPage}>
					{({ items }) =>
						items.length > 0 ? (
							items.map((server, index) => (
								<ServerRow
									key={server.uuid}
									server={server}
									css={index > 0 ? tw`mt-2` : undefined}
								/>
							))
						) : (
							<p css={tw`text-center text-sm text-neutral-400`}>
								{showOnlyAdmin
									? "There are no other servers to display."
									: "There are no servers associated with your account."}
							</p>
						)
					}
				</Pagination>
			)}
		</PageContentBlock>
	);
};
