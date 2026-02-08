import classNames from "classnames";
import type React from "react";
import styles from "@/components/server/console/style.module.css";

interface ChartBlockProps {
	title: string;
	legend?: React.ReactNode;
	children: React.ReactNode;
}

export default ({ title, legend, children }: ChartBlockProps) => (
	<div className={classNames(styles.chart_container, "group overflow-hidden")}>
		<div
			className={"absolute inset-0 z-0 pointer-events-none opacity-20"}
			style={{
				backgroundImage:
					"linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
				backgroundSize: "25% 20px",
			}}
		/>
		<div
			className={"flex items-center justify-between px-4 py-2 relative z-10"}
		>
			<h3
				className={
					"font-header font-medium transition-colors duration-100 group-hover:text-gray-50 text-sm uppercase tracking-wider text-gray-400"
				}
			>
				{title}
			</h3>
			{legend && <p className={"text-sm flex items-center"}>{legend}</p>}
		</div>
		<div className={"z-10 ml-2 relative"}>{children}</div>
	</div>
);
