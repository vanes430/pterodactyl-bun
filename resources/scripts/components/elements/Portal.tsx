import type React from "react";
import { useRef } from "react";
import { createPortal } from "react-dom";

export default ({ children }: { children: React.ReactNode }) => {
	const element = useRef(document.getElementById("modal-portal"));

	return element.current ? createPortal(children, element.current) : null;
};
