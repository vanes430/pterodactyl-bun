import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
	defaultDropAnimationSideEffects,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useStoreState } from "easy-peasy";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import useSWR from "swr";
import tw from "twin.macro";
import getServers from "@/api/getServers";
import type { PaginatedResult } from "@/api/http";
import type { Server } from "@/api/server/getServer";
import ServerRow, { ServerRowContent } from "@/components/dashboard/ServerRow";
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

	const storageKey = useMemo(
		() =>
			showOnlyAdmin
				? `pterodactyl:admin_server_order:${uuid}`
				: `pterodactyl:server_order:${uuid}`,
		[showOnlyAdmin, uuid],
	);

	const [serverOrder, setServerOrder] = useState<string[]>(() => {
		const stored = localStorage.getItem(storageKey);
		return stored ? stored.split("|") : [];
	});

	useEffect(() => {
		if (showOnlyAdmin || !showOnlyAdmin) {
			setPage(1);
		}
	}, [showOnlyAdmin]);

	const [activeId, setActiveId] = useState<string | null>(null);

	const { data: servers, error } = useSWR<PaginatedResult<Server>>(
		["/api/client/servers", showOnlyAdmin && rootAdmin, page],
		() =>
			getServers({
				page,
				type: showOnlyAdmin && rootAdmin ? "admin" : undefined,
			}),
	);

	const sortedItems = useMemo(() => {
		if (!servers?.items) return [];
		const items = [...servers.items];
		if (!serverOrder.length) return items;

		return items.sort((a, b) => {
			const aIndex = serverOrder.indexOf(a.uuid);
			const bIndex = serverOrder.indexOf(b.uuid);
			if (aIndex === -1 && bIndex === -1) return 0;
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});
	}, [servers?.items, serverOrder]);

	const activeServer = useMemo(
		() => sortedItems.find((s) => s.uuid === activeId),
		[sortedItems, activeId],
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (over && active.id !== over.id) {
			const oldIndex = sortedItems.findIndex((i) => i.uuid === active.id);
			const newIndex = sortedItems.findIndex((i) => i.uuid === over.id);

			const newItems = arrayMove(sortedItems, oldIndex, newIndex);
			const newOrder = newItems.map((i) => i.uuid);

			setServerOrder(newOrder);
			localStorage.setItem(storageKey, newOrder.join("|"));
		}
	};

	useEffect(() => {
		if (!servers) return;
		if (servers.pagination.currentPage > 1 && !servers.items.length) {
			setPage(1);
		}
	}, [servers?.pagination.currentPage, servers]);

	useEffect(() => {
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
						<div
							key={i}
							css={tw`bg-neutral-700/50 p-4 rounded-lg flex items-center`}
						>
							<Skeleton
								circle
								width={"40px"}
								height={"40px"}
								className={"mr-4"}
							/>
							<div css={tw`flex-1`}>
								<Skeleton width={"30%"} height={"1.25rem"} className={"mb-2"} />
								<Skeleton width={"20%"} height={"0.75rem"} />
							</div>
							<Skeleton width={"100px"} height={"2rem"} />
						</div>
					))}
				</div>
			) : servers.items.length > 0 ? (
				<Pagination data={servers} onPageSelect={setPage}>
					{() => (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragStart={handleDragStart}
							onDragEnd={handleDragEnd}
							onDragCancel={() => setActiveId(null)}
						>
							<SortableContext
								items={sortedItems.map((i) => i.uuid)}
								strategy={verticalListSortingStrategy}
							>
								{sortedItems.map((server, index) => (
									<ServerRow
										key={server.uuid}
										server={server}
										css={index > 0 ? tw`mt-2` : undefined}
									/>
								))}
							</SortableContext>

							<DragOverlay
								dropAnimation={{
									sideEffects: defaultDropAnimationSideEffects({
										styles: { active: { opacity: "0.5" } },
									}),
								}}
							>
								{activeId && activeServer ? (
									<ServerRowContent server={activeServer} />
								) : null}
							</DragOverlay>
						</DndContext>
					)}
				</Pagination>
			) : (
				<div
					css={tw`bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-12 text-center shadow-inner`}
				>
					<p css={tw`text-neutral-400 text-lg`}>
						{showOnlyAdmin
							? "There are no other servers to display."
							: "It looks like you don't have any servers."}
					</p>
				</div>
			)}
		</PageContentBlock>
	);
};
