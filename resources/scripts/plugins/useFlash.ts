import { type Actions, useStoreActions } from "easy-peasy";
import { toast } from "react-hot-toast";
import type { ApplicationStore } from "@/state";
import type { FlashStore, FlashMessage } from "@/state/flashes";

interface KeyedFlashStore {
	addError: (message: string, title?: string) => void;
	clearFlashes: () => void;
	clearAndAddHttpError: (error?: Error | string | null) => void;
	addSuccess: (message: string, title?: string) => void;
}

const useFlash = (): Actions<FlashStore> => {
	const actions = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	return {
		...actions,
		addFlash: (message: FlashMessage) => {
			if (message.type === "success") {
				toast.success(message.message);
			} else if (message.type === "error" || message.type === "warning") {
				toast.error(message.message);
			} else {
				toast(message.message);
			}
			return actions.addFlash(message);
		},
	};
};

const useFlashKey = (key: string): KeyedFlashStore => {
	const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

	return {
		addError: (message, title) =>
			addFlash({ key, message, title, type: "error" }),
		addSuccess: (message, title) =>
			addFlash({ key, message, title, type: "success" }),
		clearFlashes: () => clearFlashes(key),
		clearAndAddHttpError: (error) => clearAndAddHttpError({ key, error }),
	};
};

export { useFlashKey };
export default useFlash;
