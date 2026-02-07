import { Search } from "lucide-react";
import { useState } from "react";
import SearchModal from "@/components/dashboard/search/SearchModal";
import Tooltip from "@/components/elements/tooltip/Tooltip";
import useEventListener from "@/plugins/useEventListener";

export default () => {
	const [visible, setVisible] = useState(false);

	useEventListener("keydown", (e: KeyboardEvent) => {
		if (
			["input", "textarea"].indexOf(
				((e.target as HTMLElement).tagName || "input").toLowerCase(),
			) < 0
		) {
			if (!visible && e.metaKey && e.key.toLowerCase() === "/") {
				setVisible(true);
			}
		}
	});

	return (
		<>
			{visible && (
				<SearchModal
					appear
					visible={visible}
					onDismissed={() => setVisible(false)}
				/>
			)}
			<Tooltip placement={"bottom"} content={"Search"}>
				<div className={"navigation-link"} onClick={() => setVisible(true)}>
					<Search size={20} strokeWidth={2} />
				</div>
			</Tooltip>
		</>
	);
};
