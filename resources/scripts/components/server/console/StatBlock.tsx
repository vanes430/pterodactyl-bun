import classNames from "classnames";
import type React from "react";
import useFitText from "use-fit-text";
import CopyOnClick from "@/components/elements/CopyOnClick";
import styles from "./style.module.css";

interface StatBlockProps {
	title: string;
	copyOnClick?: string;
	color?: string | undefined;
	icon: React.ComponentType<any>;
	children: React.ReactNode;
	className?: string;
}

export default ({
	title,
	copyOnClick,
	icon: Icon,
	color,
	className,
	children,
}: StatBlockProps) => {
	const { fontSize, ref } = useFitText({
		minFontSize: 8,
		maxFontSize: 500,
		onFinish: () => {},
	});

	return (
		<CopyOnClick text={copyOnClick}>
			<div
				className={classNames(styles.stat_block, className, "min-w-0")}
				aria-label={`${title}: ${copyOnClick || "stat value"}`}
			>
				<div
					className={classNames(styles.status_bar, color || "bg-white/10")}
				/>
				<div
					className={classNames(
						styles.icon,
						color || "bg-white/5",
						"text-cyan-400",
					)}
				>
					<Icon size={20} />
				</div>
				<div
					className={
						"flex flex-col justify-center overflow-hidden w-full min-w-0"
					}
				>
					<h2
						className={
							"font-header font-medium leading-tight text-xs md:text-sm text-neutral-400"
						}
					>
						{title}
					</h2>
					<div
						ref={ref}
						className={"h-[1.75rem] w-full font-semibold text-gray-50 truncate"}
						style={{ fontSize }}
					>
						{children}
					</div>
				</div>
			</div>
		</CopyOnClick>
	);
};
