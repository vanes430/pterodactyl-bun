import classNames from "classnames";
import { forwardRef } from "react";
import { type ButtonProps, Options } from "@/components/elements/button/types";
import styles from "./style.module.css";
import Spinner from "@/components/elements/Spinner";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, shape, size, variant, isLoading, className, ...rest }, ref) => {
		return (
			<button
				ref={ref}
				className={classNames(
					styles.button,
					styles.primary,
					{
						[styles.secondary]: variant === Options.Variant.Secondary,
						[styles.square]: shape === Options.Shape.IconSquare,
						[styles.small]: size === Options.Size.Small,
						[styles.large]: size === Options.Size.Large,
					},
					className,
				)}
				disabled={isLoading || rest.disabled}
				{...rest}
			>
				{isLoading && (
					<Spinner
						size={Spinner.Size.SMALL}
						centered={false}
						className={"mr-2"}
					/>
				)}
				{children}
			</button>
		);
	},
);

const TextButton = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, ...props }, ref) => (
		<Button
			ref={ref as any}
			className={classNames(styles.text, className)}
			{...props}
		/>
	),
);

const DangerButton = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, ...props }, ref) => (
		<Button
			ref={ref as any}
			className={classNames(styles.danger, className)}
			{...props}
		/>
	),
);

const _Button = Object.assign(Button, {
	Sizes: Options.Size,
	Shapes: Options.Shape,
	Variants: Options.Variant,
	Text: TextButton,
	Danger: DangerButton,
});

export default _Button;
