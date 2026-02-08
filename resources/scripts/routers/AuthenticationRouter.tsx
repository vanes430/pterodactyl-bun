import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ForgotPasswordContainer from "@/components/auth/ForgotPasswordContainer";
import LoginCheckpointContainer from "@/components/auth/LoginCheckpointContainer";
import LoginContainer from "@/components/auth/LoginContainer";
import ResetPasswordContainer from "@/components/auth/ResetPasswordContainer";
import { NotFound } from "@/components/elements/ScreenBlock";

export default () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (
		<div className={"pt-8 xl:pt-32"}>
			<Routes location={location}>
				<Route path="login" element={<LoginContainer />} />
				<Route path="login/checkpoint" element={<LoginCheckpointContainer />} />
				<Route path="password" element={<ForgotPasswordContainer />} />
				<Route
					path="password/reset/:token"
					element={<ResetPasswordContainer />}
				/>
				<Route path="checkpoint" element={<div />} />
				<Route
					path="*"
					element={<NotFound onBack={() => navigate("/auth/login")} />}
				/>
			</Routes>
		</div>
	);
};
