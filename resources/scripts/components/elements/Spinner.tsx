import type React from "react";
import { type PropsWithChildren, Suspense } from "react";
import styled from "styled-components";
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

const StyledIcon = styled.svg<{
	$size?: SpinnerSize;
	$isBlue?: boolean;
}>`
	${(props) => (props.$isBlue ? tw`text-cyan-500` : tw`text-cyan-400`)};

	${(props) =>
		props.$size === "small"
			? tw`w-4 h-4`
			: props.$size === "large"
				? tw`w-16 h-16`
				: tw`w-8 h-8`};

	rect {
		fill: currentColor;
	}
`;

const Spinner: Spinner = ({ centered, ...props }) => {
	const content = (
		<StyledIcon
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			$size={props.size}
			$isBlue={props.isBlue}
			className={props.className}
		>
			<style>{`
				.spinner_zWVm{animation:spinner_5QiW 1.2s linear infinite,spinner_PnZo 1.2s linear infinite}
				.spinner_gfyD{animation:spinner_5QiW 1.2s linear infinite,spinner_4j7o 1.2s linear infinite;animation-delay:.1s}
				.spinner_T5JJ{animation:spinner_5QiW 1.2s linear infinite,spinner_fLK4 1.2s linear infinite;animation-delay:.1s}
				.spinner_E3Wz{animation:spinner_5QiW 1.2s linear infinite,spinner_tDji 1.2s linear infinite;animation-delay:.2s}
				.spinner_g2vs{animation:spinner_5QiW 1.2s linear infinite,spinner_CMiT 1.2s linear infinite;animation-delay:.2s}
				.spinner_ctYB{animation:spinner_5QiW 1.2s linear infinite,spinner_cHKR 1.2s linear infinite;animation-delay:.2s}
				.spinner_BDNj{animation:spinner_5QiW 1.2s linear infinite,spinner_Re6e 1.2s linear infinite;animation-delay:.3s}
				.spinner_rCw3{animation:spinner_5QiW 1.2s linear infinite,spinner_EJmJ 1.2s linear infinite;animation-delay:.3s}
				.spinner_Rszm{animation:spinner_5QiW 1.2s linear infinite,spinner_YJOP 1.2s linear infinite;animation-delay:.4s}
				@keyframes spinner_5QiW{0%,50%{width:7.33px;height:7.33px}25%{width:1.33px;height:1.33px}}
				@keyframes spinner_PnZo{0%,50%{x:1px;y:1px}25%{x:4px;y:4px}}
				@keyframes spinner_4j7o{0%,50%{x:8.33px;y:1px}25%{x:11.33px;y:4px}}
				@keyframes spinner_fLK4{0%,50%{x:1px;y:8.33px}25%{x:4px;y:11.33px}}
				@keyframes spinner_tDji{0%,50%{x:15.66px;y:1px}25%{x:18.66px;y:4px}}
				@keyframes spinner_CMiT{0%,50%{x:8.33px;y:8.33px}25%{x:11.33px;y:11.33px}}
				@keyframes spinner_cHKR{0%,50%{x:1px;y:15.66px}25%{x:4px;y:18.66px}}
				@keyframes spinner_Re6e{0%,50%{x:15.66px;y:8.33px}25%{x:18.66px;y:11.33px}}
				@keyframes spinner_EJmJ{0%,50%{x:8.33px;y:15.66px}25%{x:11.33px;y:18.66px}}
				@keyframes spinner_YJOP{0%,50%{x:15.66px;y:15.66px}25%{x:18.66px;y:18.66px}}
			`}</style>
			<rect className="spinner_zWVm" x="1" y="1" width="7.33" height="7.33" />
			<rect
				className="spinner_gfyD"
				x="8.33"
				y="1"
				width="7.33"
				height="7.33"
			/>
			<rect
				className="spinner_T5JJ"
				x="1"
				y="8.33"
				width="7.33"
				height="7.33"
			/>
			<rect
				className="spinner_E3Wz"
				x="15.66"
				y="1"
				width="7.33"
				height="7.33"
			/>
			<rect
				className="spinner_g2vs"
				x="8.33"
				y="8.33"
				width="7.33"
				height="7.33"
			/>
			<rect
				className="spinner_ctYB"
				x="1"
				y="15.66"
				width="7.33"
				height="7.33"
			/>
			<rect
				className="spinner_BDNj"
				x="15.66"
				y="8.33"
				width="7.33"
				height="7.33"
			/>
			<rect
				className="spinner_rCw3"
				x="8.33"
				y="15.66"
				width="7.33"
				height="7.33"
			/>
			<rect
				className="spinner_Rszm"
				x="15.66"
				y="15.66"
				width="7.33"
				height="7.33"
			/>
		</StyledIcon>
	);

	return centered ? (
		<div
			css={[
				tw`flex justify-center items-center`,
				props.size === "large" ? tw`m-20` : tw`m-6`,
			]}
		>
			{content}
		</div>
	) : (
		content
	);
};
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
