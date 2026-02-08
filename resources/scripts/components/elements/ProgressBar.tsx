import { useStoreActions, useStoreState } from "easy-peasy";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { randomInt } from "@/helpers";

const BarFill = styled(motion.div)`
    ${tw`h-full bg-cyan-400`};
    box-shadow: 0 -2px 10px 2px hsl(178, 78%, 57%);
`;

type Timer = ReturnType<typeof setTimeout>;

export default () => {
	const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
	const timeout = useRef<Timer>(null) as React.MutableRefObject<Timer>;
	const [visible, setVisible] = useState(false);
	const progress = useStoreState((state) => state.progress.progress);
	const continuous = useStoreState((state) => state.progress.continuous);
	const setProgress = useStoreActions(
		(actions) => actions.progress.setProgress,
	);

	useEffect(() => {
		return () => {
			timeout.current && clearTimeout(timeout.current);
			interval.current && clearInterval(interval.current);
		};
	}, []);

	useEffect(() => {
		setVisible((progress || 0) > 0);

		if (progress === 100) {
			timeout.current = setTimeout(() => setProgress(undefined), 500);
		}
	}, [progress, setProgress]);

	useEffect(() => {
		if (!continuous) {
			interval.current && clearInterval(interval.current);
			return;
		}

		if (!progress || progress === 0) {
			setProgress(randomInt(20, 30));
		}
	}, [continuous, progress, setProgress]);

	useEffect(() => {
		if (continuous) {
			interval.current && clearInterval(interval.current);
			if ((progress || 0) >= 90) {
				setProgress(90);
			} else {
				interval.current = setTimeout(
					() => setProgress((progress || 0) + randomInt(1, 5)),
					500,
				);
			}
		}
	}, [progress, continuous, setProgress]);

	return (
		<div css={tw`w-full fixed z-50`} style={{ height: "2px" }}>
			<AnimatePresence>
				{visible && (
					<BarFill
						initial={{ width: "0%", opacity: 0 }}
						animate={{
							width: progress === undefined ? "100%" : `${progress}%`,
							opacity: 1,
						}}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};
