import { ArrowLeft, RefreshCw } from "lucide-react";
import styled, { keyframes } from "styled-components";
import tw from "twin.macro";
import NotFoundSvg from "@/assets/images/not_found.svg";
import ServerErrorSvg from "@/assets/images/server_error.svg";
import Button from "@/components/elements/Button";
import PageContentBlock from "@/components/elements/PageContentBlock";

interface BaseProps {
	title: string;
	image: string;
	message: string;
	onRetry?: () => void;
	onBack?: () => void;
}

interface PropsWithRetry extends BaseProps {
	onRetry?: () => void;
	onBack?: never;
}

interface PropsWithBack extends BaseProps {
	onBack?: () => void;
	onRetry?: never;
}

export type ScreenBlockProps = PropsWithBack | PropsWithRetry;

const spin = keyframes`
    to { transform: rotate(360deg) }
`;

const ActionButton = styled(Button as React.FC<any>)`
    ${tw`rounded-full w-8 h-8 flex items-center justify-center p-0`} ;

    &.hover\\:spin:hover {
        animation: ${spin} 2s linear infinite;
    }
`;

const ScreenBlock = ({
	title,
	image,
	message,
	onBack,
	onRetry,
}: ScreenBlockProps) => (
	<PageContentBlock>
		<div css={tw`flex justify-center`}>
			<div
				css={tw`w-full sm:w-3/4 md:w-1/2 p-12 md:p-20 bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/50 rounded-2xl shadow-2xl text-center relative overflow-hidden`}
			>
				<div
					css={tw`absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full`}
				/>
				<div
					css={tw`absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 blur-3xl rounded-full`}
				/>
				{(typeof onBack === "function" || typeof onRetry === "function") && (
					<div css={tw`absolute left-0 top-0 ml-6 mt-6`}>
						<ActionButton
							onClick={() => (onRetry ? onRetry() : onBack ? onBack() : null)}
							className={onRetry ? "hover:spin" : undefined}
						>
							{onRetry ? <RefreshCw size={16} /> : <ArrowLeft size={16} />}
						</ActionButton>
					</div>
				)}
				<img
					src={image}
					css={tw`w-2/3 h-auto select-none mx-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
				/>
				<h2
					css={tw`mt-10 text-neutral-100 font-header font-bold text-4xl tracking-tight`}
				>
					{title}
				</h2>
				<p css={tw`text-base text-neutral-400 mt-4`}>{message}</p>
				<div css={tw`mt-10`}>
					<Button
						onClick={() => {
							if (onRetry) return onRetry();
							if (onBack) return onBack();
							window.location.href = "/";
						}}
					>
						{onRetry ? "Retry Action" : "Return to Dashboard"}
					</Button>
				</div>
			</div>
		</div>
	</PageContentBlock>
);

type ServerErrorProps = (
	| Omit<PropsWithBack, "image" | "title">
	| Omit<PropsWithRetry, "image" | "title">
) & {
	title?: string;
};

const ServerError = ({ title, ...props }: ServerErrorProps) => (
	<ScreenBlock
		title={title || "Something went wrong"}
		image={ServerErrorSvg}
		{...props}
	/>
);

const NotFound = ({
	title,
	message,
	onBack,
}: Partial<Pick<ScreenBlockProps, "title" | "message" | "onBack">>) => (
	<ScreenBlock
		title={title || "404"}
		image={NotFoundSvg}
		message={message || "The requested resource was not found."}
		onBack={onBack}
	/>
);

export { ServerError, NotFound };
export default ScreenBlock;
