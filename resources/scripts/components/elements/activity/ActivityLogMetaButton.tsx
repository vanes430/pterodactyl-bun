import { ClipboardListIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { Button } from "@/components/elements/button/index";
import { Dialog } from "@/components/elements/dialog";

export default ({ meta }: { meta: Record<string, unknown> }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className={"self-center md:px-4"}>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				hideCloseIcon
				title={"Metadata"}
			>
				<pre
					className={
						"bg-white/[0.03] border border-white/5 rounded-lg p-4 font-mono text-sm leading-relaxed overflow-x-scroll whitespace-pre-wrap text-neutral-300"
					}
				>
					{JSON.stringify(meta, null, 2)}
				</pre>
				<Dialog.Footer>
					<Button.Text onClick={() => setOpen(false)}>Close</Button.Text>
				</Dialog.Footer>
			</Dialog>
			<button
				aria-describedby={"View additional event metadata"}
				className={
					"p-2 transition-colors duration-100 text-gray-400 group-hover:text-gray-300 group-hover:hover:text-gray-50"
				}
				onClick={() => setOpen(true)}
			>
				<ClipboardListIcon className={"w-5 h-5"} />
			</button>
		</div>
	);
};
