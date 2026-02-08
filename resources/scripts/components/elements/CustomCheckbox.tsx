import type React from "react";
import { forwardRef } from "react";
import Input from "@/components/elements/Input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
	hasError?: boolean;
}

const CustomCheckbox = forwardRef<HTMLInputElement, Props>(
	({ className, ...props }, ref) => (
		<Input ref={ref} {...props} type={"checkbox"} className={className} />
	),
);

CustomCheckbox.displayName = "CustomCheckbox";

export default CustomCheckbox;
