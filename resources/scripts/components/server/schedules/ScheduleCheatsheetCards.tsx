import tw from "twin.macro";

export default () => {
	return (
		<>
			<div
				css={tw`md:w-1/2 h-full bg-white/[0.03] rounded-l-lg overflow-hidden border-r border-white/5`}
			>
				<div css={tw`flex flex-col`}>
					<h2
						css={tw`py-4 px-6 font-bold text-neutral-100 uppercase text-xs tracking-wider bg-white/5`}
					>
						Examples
					</h2>
					<div css={tw`flex py-3 px-6 bg-white/[0.02]`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>
							*/5 * * * *
						</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>every 5 minutes</div>
					</div>
					<div css={tw`flex py-3 px-6`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>
							0 */1 * * *
						</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>every hour</div>
					</div>
					<div css={tw`flex py-3 px-6 bg-white/[0.02]`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>
							0 8-12 * * *
						</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>hour range</div>
					</div>
					<div css={tw`flex py-3 px-6`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>0 0 * * *</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>once a day</div>
					</div>
					<div css={tw`flex py-3 px-6 bg-white/[0.02]`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>
							0 0 * * MON
						</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>every Monday</div>
					</div>
				</div>
			</div>
			<div
				css={tw`md:w-1/2 h-full bg-white/[0.03] rounded-r-lg overflow-hidden`}
			>
				<h2
					css={tw`py-4 px-6 font-bold text-neutral-100 uppercase text-xs tracking-wider bg-white/5`}
				>
					Special Characters
				</h2>
				<div css={tw`flex flex-col`}>
					<div css={tw`flex py-3 px-6 bg-white/[0.02]`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>*</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>any value</div>
					</div>
					<div css={tw`flex py-3 px-6`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>,</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>
							value list separator
						</div>
					</div>
					<div css={tw`flex py-3 px-6 bg-white/[0.02]`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>-</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>range values</div>
					</div>
					<div css={tw`flex py-3 px-6`}>
						<div css={tw`w-1/2 font-mono text-cyan-400 text-sm`}>/</div>
						<div css={tw`w-1/2 text-sm text-neutral-300`}>step values</div>
					</div>
				</div>
			</div>
		</>
	);
};
