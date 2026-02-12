import { StoreProvider } from "easy-peasy";
import { lazy, useEffect } from "react";
import { Toaster, toast, useToasterStore } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import tw from "twin.macro";
import { setupInterceptors } from "@/api/interceptors";
import GlobalStylesheet from "@/assets/css/GlobalStylesheet";
import AuthenticatedRoute from "@/components/elements/AuthenticatedRoute";
import ProgressBar from "@/components/elements/ProgressBar";
import { NotFound } from "@/components/elements/ScreenBlock";
import { browserHistory } from "@/components/history";
import { store } from "@/state";
import { ServerContext } from "@/state/server";
import type { SiteSettings } from "@/state/settings";
import "@/assets/tailwind.css";
import Spinner from "@/components/elements/Spinner";

const DashboardRouter = lazy(
	() => import(/* webpackChunkName: "dashboard" */ "@/routers/DashboardRouter"),
);
const ServerRouter = lazy(
	() => import(/* webpackChunkName: "server" */ "@/routers/ServerRouter"),
);
const AuthenticationRouter = lazy(
	() => import(/* webpackChunkName: "auth" */ "@/routers/AuthenticationRouter"),
);
const PlaygroundContainer = lazy(
	() => import("@/components/dashboard/PlaygroundContainer"),
);

interface ExtendedWindow extends Window {
	SiteConfiguration?: SiteSettings;
	PterodactylUser?: {
		uuid: string;
		username: string;
		email: string;
		/* eslint-disable camelcase */
		root_admin: boolean;
		use_totp: boolean;
		language: string;
		updated_at: string;
		created_at: string;
		/* eslint-enable camelcase */
	};
}

setupInterceptors(browserHistory);

const { PterodactylUser, SiteConfiguration } = window as ExtendedWindow;
if (PterodactylUser && !store.getState().user.data) {
	store.getActions().user.setUserData({
		uuid: PterodactylUser.uuid,
		username: PterodactylUser.username,
		email: PterodactylUser.email,
		language: PterodactylUser.language,
		rootAdmin: PterodactylUser.root_admin,
		useTotp: PterodactylUser.use_totp,
		createdAt: new Date(PterodactylUser.created_at),
		updatedAt: new Date(PterodactylUser.updated_at),
	});
}

if (!store.getState().settings.data) {
	store.getActions().settings.setSettings(SiteConfiguration!);
}

const App = () => {
	const { toasts } = useToasterStore();

	useEffect(() => {
		toasts
			.filter((t) => t.visible)
			.filter((_, i) => i >= 3)
			.forEach((t) => {
				toast.dismiss(t.id);
			});
	}, [toasts]);

	const Provider = StoreProvider as React.ComponentType<any>;
	const ServerProvider = ServerContext.Provider as React.ComponentType<any>;

	return (
		<>
			<GlobalStylesheet />
			<Provider store={store}>
				<Toaster
					position={"bottom-right"}
					toastOptions={{
						duration: 4000,
						style: {
							background: "#262626",
							color: "#fff",
							border: "1px solid #404040",
						},
					}}
				/>
				<ProgressBar />
				<div css={tw`mx-auto w-auto`}>
					<BrowserRouter
						future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
					>
						<Routes>
							<Route
								path="/auth/*"
								element={
									<Spinner.Suspense>
										<AuthenticationRouter />
									</Spinner.Suspense>
								}
							/>
							{process.env.NODE_ENV === "development" && (
								<Route
									path="/dev/playground"
									element={
										<Spinner.Suspense>
											<PlaygroundContainer />
										</Spinner.Suspense>
									}
								/>
							)}
							<Route
								path="/server/:id/*"
								element={
									<AuthenticatedRoute>
										<Spinner.Suspense>
											<ServerProvider>
												<ServerRouter />
											</ServerProvider>
										</Spinner.Suspense>
									</AuthenticatedRoute>
								}
							/>
							<Route
								path="/*"
								element={
									<AuthenticatedRoute>
										<Spinner.Suspense>
											<DashboardRouter />
										</Spinner.Suspense>
									</AuthenticatedRoute>
								}
							/>
							<Route path="*" element={<NotFound />} />
						</Routes>
					</BrowserRouter>
				</div>
			</Provider>
		</>
	);
};

export default App;
