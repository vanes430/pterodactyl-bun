import type React from "react";
import tw from "twin.macro";
import Modal, { type RequiredModalProps } from "@/components/elements/Modal";

interface Props extends RequiredModalProps {
	url: string;
	name: string;
}

const ImagePreviewModal = ({ url, name, ...props }: Props) => {
	return (
		<Modal {...props} top={false}>
			<div css={tw`flex flex-col items-center`}>
				<div css={tw`w-full mb-4 flex items-center justify-between`}>
					<h3 css={tw`text-lg font-header text-neutral-100 truncate pr-4`}>
						{name}
					</h3>
				</div>
				<div
					css={tw`relative w-full flex items-center justify-center bg-neutral-900/50 rounded-lg border border-white/5 overflow-hidden`}
					style={{ minHeight: "200px" }}
				>
					<img
						src={url}
						alt={name}
						css={tw`max-w-full max-h-[70vh] object-contain`}
					/>
				</div>
				<div css={tw`mt-4 w-full flex justify-end`}>
					<a
						href={url}
						download={name}
						target={"_blank"}
						rel={"noreferrer"}
						css={tw`text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-150`}
					>
						Open in new tab
					</a>
				</div>
			</div>
		</Modal>
	);
};

export default ImagePreviewModal;
