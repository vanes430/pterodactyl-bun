import type React from "react";

interface CustomIconProps {
	src: string;
	alt?: string;
	width?: number | string;
	height?: number | string;
	className?: string;
}

const CustomIcon: React.FC<CustomIconProps> = ({
	src,
	alt = "Custom icon",
	width = 20,
	height = 20,
	className = "",
}) => {
	return (
		<img
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={className}
			style={{
				verticalAlign: "middle",
				...(!Number.isNaN(Number(width)) ? {} : { width }),
				...(!Number.isNaN(Number(height)) ? {} : { height }),
			}}
		/>
	);
};

export default CustomIcon;
