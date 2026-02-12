import {
	CategoryScale,
	type ChartData,
	type ChartDataset,
	Chart as ChartJS,
	type ChartOptions,
	Filler,
	LinearScale,
	LineElement,
	PointElement,
	Tooltip,
} from "chart.js";
import { deepmerge, deepmergeCustom } from "deepmerge-ts";
import { useCallback, useMemo, useState } from "react";
import type { DeepPartial } from "ts-essentials";
import { theme } from "twin.macro";
import { hexToRgba } from "@/lib/helpers";

ChartJS.register(
	LineElement,
	PointElement,
	Filler,
	LinearScale,
	Tooltip,
	CategoryScale,
);

const options: ChartOptions<"line"> = {
	responsive: true,
	animation: false,
	plugins: {
		legend: { display: false },
		title: { display: false },
		tooltip: {
			enabled: true,
			mode: "index",
			intersect: false,
			backgroundColor: "rgba(0, 0, 0, 0.8)",
			titleFont: { family: theme("fontFamily.mono") },
			bodyFont: { family: theme("fontFamily.mono") },
			callbacks: {
				title: () => "",
			},
		},
	},
	layout: {
		padding: {
			left: 10,
			right: 10,
			top: 10,
			bottom: 10,
		},
	},
	scales: {
		x: {
			min: 0,
			max: 20,
			type: "linear",
			grid: {
				display: true,
				color: "rgba(255, 255, 255, 0.05)",
				lineWidth: 1,
			},
			ticks: {
				display: true,
				count: 5,
				color: "rgba(255, 255, 255, 0.2)",
				font: {
					family: theme("fontFamily.mono"),
					size: 10,
				},
			},
		},
		y: {
			min: 0,
			type: "linear",
			grid: {
				display: true,
				color: "rgba(255, 255, 255, 0.08)",
				lineWidth: 1,
			},
			ticks: {
				display: true,
				count: 5,
				color: theme("colors.neutral.400"),
				font: {
					family: theme("fontFamily.mono"),
					size: 10,
				},
			},
		},
	},
	elements: {
		point: {
			radius: 0,
			hoverRadius: 4,
			hoverBackgroundColor: theme("colors.cyan.400"),
		},
		line: {
			tension: 0.3,
			borderWidth: 2,
		},
	},
};

function getOptions(
	opts?: DeepPartial<ChartOptions<"line">> | undefined,
): ChartOptions<"line"> {
	return deepmerge(options, opts || {}) as ChartOptions<"line">;
}

type ChartDatasetCallback = (
	value: ChartDataset<"line">,
	index: number,
) => ChartDataset<"line">;

function getEmptyData(
	label: string,
	sets = 1,
	callback?: ChartDatasetCallback | undefined,
): ChartData<"line"> {
	const next = callback || ((value) => value);

	return {
		labels: Array(21)
			.fill(0)
			.map((_, index) => index),
		datasets: Array(sets)
			.fill(0)
			.map((_, index) =>
				next(
					{
						fill: true,
						label,
						data: Array(21).fill(-5),
						borderColor: theme("colors.cyan.500"),
						backgroundColor: hexToRgba(theme("colors.cyan.500"), 0.1),
					},
					index,
				),
			),
	};
}

const merge = deepmergeCustom({ mergeArrays: false });

interface UseChartOptions {
	sets: number;
	options?: DeepPartial<ChartOptions<"line">> | number | undefined;
	callback?: ChartDatasetCallback | undefined;
}

function useChart(label: string, opts?: UseChartOptions) {
	const chartOptions = useMemo(
		() =>
			getOptions(
				typeof opts?.options === "number"
					? { scales: { y: { min: 0, suggestedMax: opts.options } } }
					: opts?.options,
			),
		[opts?.options],
	);

	const [data, setData] = useState(
		getEmptyData(label, opts?.sets || 1, opts?.callback),
	);

	const push = useCallback(
		(items: number | null | (number | null)[]) =>
			setData((state) => ({
				...state,
				datasets: state.datasets.map((dataset, index) => {
					const item = Array.isArray(items) ? items[index] : items;
					return {
						...dataset,
						data: dataset.data
							.slice(1)
							.concat(
								typeof item === "number" ? Number(item.toFixed(2)) : item,
							),
					};
				}),
			})),
		[],
	);

	const clear = useCallback(
		() =>
			setData((state) => ({
				...state,
				datasets: state.datasets.map((dataset) => ({
					...dataset,
					data: Array(21).fill(-5),
				})),
			})),
		[],
	);

	return useMemo(
		() => ({ props: { data, options: chartOptions }, push, clear }),
		[data, chartOptions, push, clear],
	);
}

function useChartTickLabel(
	label: string,
	max: number,
	tickLabel: string,
	roundTo?: number,
) {
	return useChart(
		label,
		useMemo(
			() => ({
				sets: 1,
				options: {
					scales: {
						y: {
							suggestedMax: max,
							ticks: {
								callback(value) {
									return `${roundTo ? Number(value).toFixed(roundTo) : value}${tickLabel}`;
								},
							},
						},
					},
				},
			}),
			[max, tickLabel, roundTo],
		),
	);
}

export { useChart, useChartTickLabel, getOptions, getEmptyData };
