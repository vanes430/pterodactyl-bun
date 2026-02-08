import type React from "react";
import { useContext } from "react";
import { useDeepCompareEffect } from "@/plugins/useDeepCompareEffect";
import { DialogContext } from "./context";

export default ({ children }: { children: React.ReactNode }): null => {
	const { setFooter } = useContext(DialogContext);

	useDeepCompareEffect(() => {
		setFooter(
			<div
				className={
					"px-6 py-4 bg-white/5 flex items-center justify-end space-x-3 border-t border-white/5"
				}
			>
				{children}
			</div>,
		);
	}, [children]);

	return null;
};
