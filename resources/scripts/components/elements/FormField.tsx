import type React from "react";
import { forwardRef } from "react";
import tw from "twin.macro";
import Input from "@/components/elements/Input";
import Label from "@/components/elements/Label";

interface Props
	extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
	label?: string;
	description?: string;
	error?: string;
	isLight?: boolean;
	as?: React.ElementType;
	[key: string]: any;
}

const FormField = forwardRef<any, Props>(
	(
		{ label, description, error, isLight, as: Component = Input, id, ...props },
		ref,
	) => {
		return (
			<div>
				{label && (
					<Label htmlFor={id} isLight={isLight}>
						{label}
					</Label>
				)}
				<Component
					id={id}
					ref={ref}
					isLight={isLight}
					hasError={!!error}
					{...props}
				/>
				{error ? (
					<p css={tw`mt-1 text-xs text-red-500`}>
						{error.charAt(0).toUpperCase() + error.slice(1)}
					</p>
				) : description ? (
					<p css={tw`mt-1 text-xs text-neutral-400`}>{description}</p>
				) : null}
			</div>
		);
	},
);

FormField.displayName = "FormField";

export default FormField;
