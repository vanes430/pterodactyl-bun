import type React from "react";
import { CSSTransition } from "react-transition-group";
import type { CSSTransitionProps } from "react-transition-group/CSSTransition";
import styled from "styled-components";
import tw from "twin.macro";

interface Props extends Omit<CSSTransitionProps, "timeout" | "classNames"> {
	timeout: number;
}

const Container = styled.div<{ timeout: number }>`
    .fade-enter,
    .fade-exit,
    .fade-appear {
        will-change: opacity;
    }

    .fade-enter,
    .fade-appear {
        ${tw`opacity-0`};

        &.fade-enter-active,
        &.fade-appear-active {
            ${tw`opacity-100 transition-opacity ease-in`};
            transition-duration: ${(props) => props.timeout}ms;
        }
    }

    .fade-exit {
        ${tw`opacity-100`};

        &.fade-exit-active {
            ${tw`opacity-0 transition-opacity ease-in`};
            transition-duration: ${(props) => props.timeout}ms;
        }
    }
`;

const Fade: React.FC<Props> = ({ timeout, children, ...props }) => (
	<CSSTransition timeout={timeout} classNames={"fade"} {...props}>
		<Container timeout={timeout}>{children}</Container>
	</CSSTransition>
);
Fade.displayName = "Fade";

export default Fade;
