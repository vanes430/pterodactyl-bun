import type { PropsWithChildren } from "react";
import Can from "@/components/elements/Can";
import { ServerError } from "@/components/elements/ScreenBlock";

interface Props {
	permission: string | string[] | null;
}

export default ({ permission, children }: PropsWithChildren<Props>) => {
	if (!permission) {
		return <>{children}</>;
	}

	return (
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
	);
};
