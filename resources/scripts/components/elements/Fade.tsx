import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import type { PropsWithChildren } from "react";

interface Props {
	timeout?: number;
	in?: boolean;
	appear?: boolean;
	unmountOnExit?: boolean;
	onExited?: () => void;
}

const Fade: React.FC<PropsWithChildren<Props>> = ({
	timeout = 150,
	in: show,
	appear = true,
	onExited,
	children,
}) => (
	<AnimatePresence initial={appear} onExitComplete={onExited}>
		{show && (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: timeout / 1000 }}
				style={{ display: "contents" }}
			>
				{children}
			</motion.div>
		)}
	</AnimatePresence>
);

Fade.displayName = "Fade";

export default Fade;
