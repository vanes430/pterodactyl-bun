import { DownloadCloud } from "lucide-react";
import tw from "twin.macro";
import type { ModrinthPlugin } from "@/api/server/modrinth/types";
import Button from "@/components/elements/Button";
import TitledGreyBox from "@/components/elements/TitledGreyBox";

interface Props {
	plugin: ModrinthPlugin;
	onSelect: (plugin: ModrinthPlugin) => void;
}

const PluginCard = ({ plugin, onSelect }: Props) => {
	return (
		<TitledGreyBox
			title={
				<div css={tw`flex items-center justify-center w-full`}>
					<p css={tw`text-sm uppercase truncate font-medium`}>{plugin.title}</p>
				</div>
			}
			css={tw`h-full`}
		>
			<div css={tw`flex flex-col items-center text-center h-full`}>
				{/* Icon Section - Fixed size */}
				<div
					css={tw`w-20 h-20 bg-neutral-900 rounded-xl mb-4 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner`}
				>
					{plugin.icon_url ? (
						<img
							src={plugin.icon_url}
							alt={plugin.title}
							css={tw`w-full h-full object-cover`}
						/>
					) : (
						<DownloadCloud size={32} css={tw`text-neutral-600`} />
					)}
				</div>

				{/* Description Section - Fixed height (3 lines) */}
				<div
					css={tw`w-full mb-4 h-12 overflow-hidden flex items-start justify-center`}
				>
					<p
						css={tw`text-[11px] text-neutral-400 line-clamp-3 leading-relaxed`}
					>
						{plugin.description || "No description provided."}
					</p>
				</div>

				{/* Bottom Section - Pushed to bottom using mt-auto */}
				<div css={tw`mt-auto w-full flex flex-col items-center`}>
					<div css={tw`w-full border-t border-white/5 pt-3 mb-3`}>
						<div
							css={tw`text-[10px] text-neutral-500 uppercase tracking-wider truncate mb-0.5`}
						>
							{plugin.author}
						</div>
						<div css={tw`text-xs text-cyan-400 font-semibold`}>
							{plugin.downloads.toLocaleString()} downloads
						</div>
					</div>

					<Button
						onClick={() => onSelect(plugin)}
						css={tw`w-full`}
						size={"xsmall"}
					>
						Install
					</Button>
				</div>
			</div>
		</TitledGreyBox>
	);
};

export default PluginCard;
