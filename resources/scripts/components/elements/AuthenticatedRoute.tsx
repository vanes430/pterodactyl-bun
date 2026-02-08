import { Navigate, useLocation } from "react-router-dom";
import { useStoreState } from "@/state/hooks";

export default ({ children }: React.PropsWithChildren<unknown>) => {
	const isAuthenticated = useStoreState((state) => !!state.user.data?.uuid);
	const location = useLocation();

	if (isAuthenticated) {
		return <>{children}</>;
	}

	return <Navigate to="/auth/login" state={{ from: location }} replace />;
};
