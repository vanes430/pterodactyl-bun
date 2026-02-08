import type React from "react";
import type { PropsWithChildren } from "react";
import Can from "@/components/elements/Can";
import { ServerError } from "@/components/elements/ScreenBlock";

export interface RequireServerPermissionProps {
	permissions: string | string[];
}

const RequireServerPermission: React.FC<
	PropsWithChildren<RequireServerPermissionProps>
> = ({ children, permissions }) => {
	return (
		<Can
			action={permissions}
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

export default RequireServerPermission;
