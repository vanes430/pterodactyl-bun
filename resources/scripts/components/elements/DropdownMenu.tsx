import React, { createRef } from "react";
import styled from "styled-components/macro";
import tw from "twin.macro";
import Fade from "@/components/elements/Fade";

interface Props {
	children: React.ReactNode;
	renderToggle: (
		onClick: (e: React.MouseEvent<any, MouseEvent>) => void,
	) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2 flex items-center rounded w-full text-neutral-500`};
    transition: 150ms all ease;

    &:hover {
        ${(props) => (props.danger ? tw`text-red-700 bg-red-100` : tw`text-neutral-700 bg-neutral-100`)};
    }
`;

interface State {
	posX: number;
	posY: number;
	visible: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
	menu = createRef<HTMLDivElement>();

	state: State = {
		posX: 0,
		posY: 0,
		visible: false,
	};

	componentWillUnmount() {
		this.removeListeners();
	}

	componentDidUpdate(_prevProps: Readonly<Props>, prevState: Readonly<State>) {
		const menu = this.menu.current;

		if (this.state.visible && !prevState.visible && menu) {
			document.addEventListener("click", this.windowListener);
			document.addEventListener("contextmenu", this.contextMenuListener);

			const { posX, posY } = this.state;
			const { clientWidth, clientHeight } = menu;
			const { innerWidth, innerHeight } = window;

			// Horizontal positioning
			let left = posX;
			if (posX + clientWidth > innerWidth - 10) {
				left = posX - clientWidth;
			}
			// Ensure it doesn't go off-screen to the left either
			left = Math.max(10, left);

			// Vertical positioning
			let top = posY;
			if (posY + clientHeight > innerHeight - 10) {
				top = posY - clientHeight;
			}
			// Ensure it doesn't go off-screen to the top
			top = Math.max(10, top);

			menu.style.left = `${Math.round(left)}px`;
			menu.style.top = `${Math.round(top)}px`;
		}

		if (!this.state.visible && prevState.visible) {
			this.removeListeners();
		}
	}

	removeListeners = () => {
		document.removeEventListener("click", this.windowListener);
		document.removeEventListener("contextmenu", this.contextMenuListener);
	};

	onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
		e.preventDefault();
		this.triggerMenu(e.clientX, e.clientY);
	};

	contextMenuListener = () => this.setState({ visible: false });

	windowListener = (e: MouseEvent) => {
		const menu = this.menu.current;

		if (e.button === 2 || !this.state.visible || !menu) {
			return;
		}

		if (e.target === menu || menu.contains(e.target as Node)) {
			return;
		}

		this.setState({ visible: false });
	};

	triggerMenu = (posX: number, posY: number) =>
		this.setState((s) => ({
			posX: !s.visible ? posX : s.posX,
			posY: !s.visible ? posY : s.posY,
			visible: !s.visible,
		}));

	render() {
		return (
			<div>
				{this.props.renderToggle(this.onClickHandler)}
				<Fade timeout={150} in={this.state.visible} unmountOnExit>
					<div
						ref={this.menu}
						onClick={(e) => {
							e.stopPropagation();
							this.setState({ visible: false });
						}}
						style={{ width: "12rem" }}
						css={tw`fixed bg-white p-2 rounded border border-neutral-700 shadow-lg text-neutral-500 z-[100]`}
					>
						{this.props.children}
					</div>
				</Fade>
			</div>
		);
	}
}

export default DropdownMenu;
