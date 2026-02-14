import type React from "react";
import { memo } from "react";
import isEqual from "react-fast-compare";
import tw from "twin.macro";

interface Props {
	icon?: React.ComponentType<any>;
	title: string | React.ReactNode;
	className?: string;
	children: React.ReactNode;
}

const TitledGreyBox = ({ icon: Icon, title, children, className }: Props) => (
	<div
		css={tw`rounded-xl overflow-hidden border border-cyan-500/50 flex flex-col`}
		className={className}
	>
		<div css={tw`bg-neutral-800/50 p-3`}>
			{typeof title === "string" ? (
				<div css={tw`flex items-center text-sm uppercase`}>
					{Icon && (
						<div css={tw`mr-2 text-neutral-300`}>
							<Icon size={14} />
						</div>
					)}
					{title}
				</div>
			) : (
				title
			)}
		</div>
		<div css={tw`p-3 flex-1 flex flex-col`}>{children}</div>
	</div>
);

export default memo(TitledGreyBox, isEqual);
