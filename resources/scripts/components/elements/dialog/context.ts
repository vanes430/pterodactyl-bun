import React from "react";
import type { DialogContextType, DialogWrapperContextType } from "./types";

export const DialogContext = React.createContext<DialogContextType>({
	setIcon: () => {},
	setFooter: () => {},
	setIconPosition: () => {},
});

export const DialogWrapperContext =
	React.createContext<DialogWrapperContextType>({
		props: {},
		setProps: () => {},
		close: () => {},
	});
