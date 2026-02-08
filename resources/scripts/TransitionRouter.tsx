import React from "react";
import { Route } from "react-router";
import styled from "styled-components";
import tw from "twin.macro";

const AspectRatioContainer = styled.div`
    ${tw`w-full`};
`;

const TransitionRouter: React.FC<React.PropsWithChildren<unknown>> = ({
	children,
}) => {
	return (
		<Route
			render={({ location }) => (
				<AspectRatioContainer>
					{React.isValidElement(children)
						? React.cloneElement(children as any, {
								location,
							})
						: children}
				</AspectRatioContainer>
			)}
		/>
	);
};

export default TransitionRouter;
