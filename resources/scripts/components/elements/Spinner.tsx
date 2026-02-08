import { RectangleEllipsis } from "lucide-react";
import type React from "react";
import { type PropsWithChildren, Suspense } from "react";
import styled, { keyframes } from "styled-components/macro";
import tw from "twin.macro";
import ErrorBoundary from "@/components/elements/ErrorBoundary";

export type SpinnerSize = "small" | "base" | "large";

interface Props {
	size?: SpinnerSize;
	centered?: boolean;
	isBlue?: boolean;
	className?: string;
}

interface Spinner extends React.FC<Props> {
	Size: Record<"SMALL" | "BASE" | "LARGE", SpinnerSize>;
	Suspense: React.FC<PropsWithChildren<Props>>;
}

const pulse = keyframes`
    0%, 100% { opacity: 0.4; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.05); }
`;

const StyledIcon = styled(RectangleEllipsis as React.FC<any>)<{
	$size?: SpinnerSize;
	$isBlue?: boolean;
}>`
	animation: ${pulse} 1.5s ease-in-out infinite;
	${(props) => (props.$isBlue ? tw`text-blue-500` : tw`text-white`)};

	${(props) =>
		props.$size === "small"
			? tw`w-4 h-4`
			: props.$size === "large"
				? tw`w-16 h-16`
				: tw`w-8 h-8`};
`;

const Spinner: Spinner = ({ centered, ...props }) =>
	centered ? (
		<div
			css={[
				tw`flex justify-center items-center`,
				props.size === "large" ? tw`m-20` : tw`m-6`,
			]}
		>
			<StyledIcon
				$size={props.size}
				$isBlue={props.isBlue}
				className={props.className}
			/>
		</div>
	) : (
		<StyledIcon
			$size={props.size}
			$isBlue={props.isBlue}
			className={props.className}
		/>
	);
Spinner.displayName = "Spinner";

Spinner.Size = {
	SMALL: "small",
	BASE: "base",
	LARGE: "large",
};

Spinner.Suspense = ({
	children,
	centered = true,
	size = Spinner.Size.LARGE,
	...props
}) => (
	<Suspense fallback={<Spinner centered={centered} size={size} {...props} />}>
		<ErrorBoundary>{children}</ErrorBoundary>
	</Suspense>
);
Spinner.Suspense.displayName = "Spinner.Suspense";

export default Spinner;
