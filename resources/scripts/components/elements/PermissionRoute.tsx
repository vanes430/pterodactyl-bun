import type { PropsWithChildren } from "react";
import type { RouteProps } from "react-router";
import { Route } from "react-router-dom";
import Can from "@/components/elements/Can";
import { ServerError } from "@/components/elements/ScreenBlock";

interface Props extends Omit<RouteProps, "path"> {
	path: string;
	permission: string | string[] | null;
}

export default ({
	permission,
	children,
	...props
}: PropsWithChildren<Props>) => (
	<Route {...(props as any)}>
		{!permission ? (
			children
		) : (
			<Can
				matchAny
				action={permission}
				renderOnError={
					<ServerError
						title={"Access Denied"}
						message={"You do not have permission to access this page."}
					/>
				}
			>
				{children}
			</Can>
		)}
	</Route>
);
