import React from "react";
import styled, { keyframes } from "styled-components/macro";
import tw from "twin.macro";

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const SkeletonBase = styled.div<{ width?: string; height?: string; circle?: boolean }>`
    ${tw`bg-neutral-700`};
    width: ${props => props.width || "100%"};
    height: ${props => props.height || "1rem"};
    border-radius: ${props => props.circle ? "50%" : "4px"};
    animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

interface Props {
	width?: string;
	height?: string;
	circle?: boolean;
	className?: string;
}

const Skeleton = ({ width, height, circle, className }: Props) => (
	<SkeletonBase width={width} height={height} circle={circle} className={className} />
);

export default Skeleton;
