import classNames from "classnames";
import copy from "copy-to-clipboard";
import React from "react";
import { toast } from "react-hot-toast";

interface CopyOnClickProps {
	text: string | number | null | undefined;
	showInNotification?: boolean;
	children: React.ReactNode;
}

const CopyOnClick = ({
	text,
	showInNotification = true,
	children,
}: CopyOnClickProps) => {
	if (!React.isValidElement(children)) {
		throw new Error(
			"Component passed to <CopyOnClick/> must be a valid React element.",
		);
	}

	const child = !text
		? React.Children.only(children)
		: React.cloneElement(React.Children.only(children), {
				// @ts-ignore
				className: classNames(children.props.className || "", "cursor-pointer"),
				onClick: (e: React.MouseEvent<HTMLElement>) => {
					copy(String(text));
					if (showInNotification) {
						toast.success(
							<div className={"flex flex-col text-left"}>
								<span
									className={
										"text-[10px] uppercase tracking-wider text-neutral-400"
									}
								>
									Copied
								</span>
								<span className={"font-mono text-sm break-all my-1 text-white"}>
									"{String(text)}"
								</span>
								<span
									className={
										"text-[10px] uppercase tracking-wider text-neutral-400"
									}
								>
									to clipboard
								</span>
							</div>,
						);
					}
					if (typeof children.props.onClick === "function") {
						children.props.onClick(e);
					}
				},
			});

	return <>{child}</>;
};

export default CopyOnClick;
