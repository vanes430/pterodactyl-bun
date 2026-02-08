import React, { createRef } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import tw from "twin.macro";
import Fade from "@/components/elements/Fade";

interface Props {
	children: React.ReactNode;
	renderToggle: (
		onClick: (e: React.MouseEvent<any, MouseEvent>) => void,
	) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2 flex items-center rounded w-full text-neutral-300 cursor-pointer select-none`};
    transition: 150ms all ease;

    &:hover {
        ${(props) => (props.danger ? tw`text-red-400 bg-red-500/10` : tw`text-white bg-white/10`)};
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
			setTimeout(() => {
				if (this.state.visible) {
					document.addEventListener("click", this.windowListener);
					document.addEventListener("contextmenu", this.contextMenuListener);
				}
			}, 0);

			const { posX, posY } = this.state;
			const { clientWidth, clientHeight } = menu;
			const { innerWidth, innerHeight } = window;
			const { scrollX, scrollY } = window;

			// Horizontal positioning
			let left = posX;
			if (posX - scrollX + clientWidth > innerWidth - 10) {
				left = posX - clientWidth;
			}
			left = Math.max(scrollX + 10, left);

			// Vertical positioning
			let top = posY;
			if (posY - scrollY + clientHeight > innerHeight - 10) {
				top = posY - clientHeight;
			}
			top = Math.max(scrollY + 10, top);

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
		this.triggerMenu(e.pageX, e.pageY);
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

	triggerMenu = (posX: number, posY: number) => {
		if (this.state.visible) {
			this.setState({ visible: false }, () => {
				setTimeout(() => {
					this.setState({ posX, posY, visible: true });
				}, 20);
			});
		} else {
			this.setState({ posX, posY, visible: true });
		}
	};

	render() {
		const portal = document.getElementById("modal-portal");

		return (
			<>
				{this.props.renderToggle(this.onClickHandler)}
				{portal &&
					createPortal(
						<Fade
							timeout={100}
							in={this.state.visible}
							unmountOnExit
							appear={false}
						>
							<div
								ref={this.menu}
								onClick={(e) => {
									e.stopPropagation();
									this.setState({ visible: false });
								}}
								style={{ width: "12rem", position: "absolute", zIndex: 9999 }}
								css={tw`bg-neutral-900/80 backdrop-blur-xl p-2 rounded-xl border border-white/10 shadow-2xl text-neutral-300 cursor-default select-none`}
							>
								{this.props.children}
							</div>
						</Fade>,
						portal,
					)}
			</>
		);
	}
}

export default DropdownMenu;
