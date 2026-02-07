import styled from "styled-components/macro";
import tw, { type TwStyle } from "twin.macro";

export type FlashMessageType = "success" | "info" | "warning" | "error";

interface Props {
	title?: string;
	children: string;
	type?: FlashMessageType;
}

const styling = (type?: FlashMessageType): TwStyle | string => {
	switch (type) {
		case "error":
			return tw`bg-red-500/20 border-red-500/20 text-red-400`;
		case "info":
			return tw`bg-cyan-500/20 border-cyan-500/20 text-cyan-400`;
		case "success":
			return tw`bg-green-500/20 border-green-500/20 text-green-400`;
		case "warning":
			return tw`bg-yellow-500/20 border-yellow-500/20 text-yellow-400`;
		default:
			return tw`bg-white/10 border-white/10 text-white`;
	}
};

const getBackground = (type?: FlashMessageType): TwStyle | string => {
	switch (type) {
		case "error":
			return tw`bg-red-500/20`;
		case "info":
			return tw`bg-cyan-500/20`;
		case "success":
			return tw`bg-green-500/20`;
		case "warning":
			return tw`bg-yellow-500/20`;
		default:
			return tw`bg-white/10`;
	}
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`p-3 border items-center leading-normal rounded-xl flex w-full text-sm transition-all duration-200`};
    ${(props) => styling(props.$type)};
`;
Container.displayName = "MessageBox.Container";

const MessageBox = ({ title, children, type }: Props) => (
	<Container css={tw`lg:inline-flex`} $type={type} role={"alert"}>
		{title && (
			<span
				className={"title"}
				css={[
					tw`flex rounded-full uppercase px-2 py-1 text-xs font-bold mr-3 leading-none`,
					getBackground(type),
				]}
			>
				{title}
			</span>
		)}
		<span css={tw`mr-2 text-left flex-auto`}>{children}</span>
	</Container>
);
MessageBox.displayName = "MessageBox";

export default MessageBox;
