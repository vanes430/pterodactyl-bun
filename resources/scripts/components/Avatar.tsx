import type React from "react";
import { useState } from "react";
import { useStoreState } from "@/state/hooks";

interface AvatarProps {
	name: string;
	style?: React.CSSProperties;
	className?: string;
}

const AvatarComponent = ({ name, style, className }: AvatarProps) => {
	const [isError, setIsError] = useState(false);

	// Jika API DiceBear down atau gagal load, tampilkan fallback SVG standar
	if (isError) {
		return (
			<div
				style={style}
				className={className}
				css={`
                    background-color: #374151;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                `}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					css={`
                        color: #9ca3af;
                        width: 80%;
                        height: 80%;
                    `}
				>
					<path
						fillRule="evenodd"
						d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
						clipRule="evenodd"
					/>
				</svg>
			</div>
		);
	}

	return (
		<img
			src={`https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
			alt={"avatar"}
			style={style}
			className={className}
			onError={() => setIsError(true)}
			css={`
                border-radius: 4px;
                display: block;
            `}
		/>
	);
};

const UserAvatar = ({ style, className }: Omit<AvatarProps, "name">) => {
	const uuid = useStoreState((state) => state.user.data?.uuid);

	return (
		<AvatarComponent
			name={uuid || "system"}
			style={style}
			className={className}
		/>
	);
};

const Avatar = Object.assign(AvatarComponent, {
	User: UserAvatar,
});

export default Avatar;
