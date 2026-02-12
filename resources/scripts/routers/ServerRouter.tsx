import { useStoreState } from "easy-peasy";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Route, Routes, useParams } from "react-router-dom";
import tw from "twin.macro";
import { httpErrorToHuman } from "@/api/http";
import ErrorBoundary from "@/components/elements/ErrorBoundary";
import PermissionRoute from "@/components/elements/PermissionRoute";
import { NotFound, ServerError } from "@/components/elements/ScreenBlock";
import Spinner from "@/components/elements/Spinner";
import NavigationBar from "@/components/NavigationBar";
import ConflictStateRenderer from "@/components/server/ConflictStateRenderer";
import InstallListener from "@/components/server/InstallListener";
import ServerSidebar from "@/components/server/ServerSidebar";
import TransferListener from "@/components/server/TransferListener";
import WebsocketHandler from "@/components/server/WebsocketHandler";
import useFlash from "@/plugins/useFlash";
import routes from "@/routers/routes";
import { ServerContext } from "@/state/server";

export default () => {
	const params = useParams<{ id: string }>();
	const location = useLocation();

	const { clearAndAddHttpError } = useFlash();
	const rootAdmin = useStoreState((state) => state.user.data?.rootAdmin);
	const [error, setError] = useState("");

	const id = ServerContext.useStoreState((state) => state.server.data?.id);
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const inConflictState = ServerContext.useStoreState(
		(state) => state.server.inConflictState,
	);
	const getServer = ServerContext.useStoreActions(
		(actions) => actions.server.getServer,
	);
	const clearServerState = ServerContext.useStoreActions(
		(actions) => actions.clearServerState,
	);

	useEffect(
		() => () => {
			clearServerState();
		},
		[clearServerState],
	);

	useEffect(() => {
		setError("");

		if (params.id) {
			getServer(params.id).catch((error) => {
				setError(httpErrorToHuman(error));
				clearAndAddHttpError({ key: "server", error });
			});
		}

		return () => {
			clearServerState();
		};
	}, [params.id, clearServerState, getServer, clearAndAddHttpError]);

	return (
		<React.Fragment key={"server-router"}>
			<NavigationBar />
			{!uuid || !id ? (
				error ? (
					<ServerError message={error} />
				) : (
					<Spinner size={"large"} centered />
				)
			) : (
				<main css={tw`flex flex-col md:flex-row w-full`}>
					<ServerSidebar />
					<div css={tw`flex-1 flex justify-center`}>
						<div css={tw`w-full max-w-[1600px] p-4 md:p-8 md:pt-4`}>
							<InstallListener />
							<TransferListener />
							<WebsocketHandler />
							{inConflictState &&
							(!rootAdmin ||
								(rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
								<ConflictStateRenderer />
							) : (
								<ErrorBoundary>
									<Routes>
										{routes.server.map(
											({ path, permission, component: Component }) => (
												<Route
													key={path}
													path={path.replace(/^\//, "")}
													element={
														<PermissionRoute permission={permission}>
															<Spinner.Suspense>
																<Component />
															</Spinner.Suspense>
														</PermissionRoute>
													}
												/>
											),
										)}
										<Route path="*" element={<NotFound />} />
									</Routes>
								</ErrorBoundary>
							)}
						</div>
					</div>
				</main>
			)}
		</React.Fragment>
	);
};
