import React from "react";
import { useLocation } from "react-router";
import { Route, Routes } from "react-router-dom";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { NotFound } from "@/components/elements/ScreenBlock";
import Spinner from "@/components/elements/Spinner";
import NavigationBar from "@/components/NavigationBar";
import routes from "@/routers/routes";

export default () => {
	const location = useLocation();

	return (
		<>
			<NavigationBar />
			<main>
				<React.Suspense fallback={<Spinner centered />}>
					<Routes>
						<Route path="/" element={<DashboardContainer />} />
						{routes.account.map(({ path, component: Component }) => (
							<Route
								key={path}
								path={`/account/${path}`.replace("//", "/")}
								element={<Component />}
							/>
						))}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</React.Suspense>
			</main>
		</>
	);
};
