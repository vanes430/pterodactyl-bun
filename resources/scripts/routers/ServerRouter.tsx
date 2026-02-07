import { useStoreState } from "easy-peasy";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Route, Switch, useRouteMatch } from "react-router-dom";
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
import routes from "@/routers/routes";
import { ServerContext } from "@/state/server";

export default () => {
	const match = useRouteMatch<{ id: string }>();
	const location = useLocation();

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

	const to = (value: string, url = false) => {
		if (value === "/") {
			return url ? match.url : match.path;
		}
		return `${(url ? match.url : match.path).replace(/\/*$/, "")}/${value.replace(/^\/+/, "")}`;
	};

	useEffect(
		() => () => {
			clearServerState();
		},
		[clearServerState],
	);

	useEffect(() => {
		setError("");

		getServer(match.params.id).catch((error) => {
			console.error(error);
			setError(httpErrorToHuman(error));
		});

		return () => {
			clearServerState();
		};
	}, [match.params.id, clearServerState, getServer]);

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
				<div css={tw`flex flex-col md:flex-row w-full h-full`}>
					<ServerSidebar />
					<div css={tw`flex-1 overflow-x-hidden p-4 md:p-10 min-h-screen`}>
						<InstallListener />
						<TransferListener />
						<WebsocketHandler />
						{inConflictState &&
						(!rootAdmin ||
							(rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
							<ConflictStateRenderer />
						) : (
							<ErrorBoundary>
								<Switch location={location}>
									{routes.server.map(
										({ path, permission, component: Component }) => (
											<PermissionRoute
												key={path}
												permission={permission}
												path={to(path)}
												exact
											>
												<Spinner.Suspense>
													<Component />
												</Spinner.Suspense>
											</PermissionRoute>
										),
									)}
									<Route path={"*"} component={NotFound} />
								</Switch>
							</ErrorBoundary>
						)}
					</div>
				</div>
			)}
		</React.Fragment>
	);
};
