import { Search } from "lucide-react";
import { lazy, useState } from "react";
import Spinner from "@/components/elements/Spinner";
import Tooltip from "@/components/elements/tooltip/Tooltip";
import useEventListener from "@/plugins/useEventListener";

const SearchModal = lazy(
	() => import("@/components/dashboard/search/SearchModal"),
);

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
				<Spinner.Suspense>
					<SearchModal
						appear
						visible={visible}
						onDismissed={() => setVisible(false)}
					/>
				</Spinner.Suspense>
			)}
			<Tooltip placement={"bottom"} content={"Search"}>
				<div className={"navigation-link"} onClick={() => setVisible(true)}>
					<Search size={20} strokeWidth={2} />
				</div>
			</Tooltip>
		</>
	);
};
