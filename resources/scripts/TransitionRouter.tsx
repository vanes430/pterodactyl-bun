import React from "react";
import { Route } from "react-router";
import styled from "styled-components/macro";
import tw from "twin.macro";

const AspectRatioContainer = styled.div`
    ${tw`w-full`};
`;

const TransitionRouter: React.FC = ({ children }) => {
	return (
		<Route
			render={({ location }) => (
				<AspectRatioContainer>
					{React.isValidElement(children)
						? React.cloneElement(children as React.ReactElement<any>, {
								location,
							})
						: children}
				</AspectRatioContainer>
			)}
		/>
	);
};

export default TransitionRouter;
