import { type Actions, useStoreActions } from "easy-peasy";
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { httpErrorToHuman } from "@/api/http";
import type { ApplicationStore } from "@/state";
import type { FlashMessage } from "@/state/flashes";

interface KeyedFlashStore {
	addError: (message: string, title?: string) => void;
	clearFlashes: () => void;
	clearAndAddHttpError: (error?: Error | string | null) => void;
	addSuccess: (message: string, title?: string) => void;
}

const useFlash = () => {
	const actions = useStoreActions(
		(actions: Actions<ApplicationStore>) => actions.flashes,
	);

	const addFlash = useCallback(
		(message: FlashMessage) => {
			if (message.type === "success") {
				toast.success(message.message);
			} else if (message.type === "error" || message.type === "warning") {
				toast.error(message.message);
			} else {
				toast(message.message);
			}
			return actions.addFlash(message);
		},
		[actions],
	);

	return {
		...actions,
		addFlash,
		clearAndAddHttpError: useCallback(
			(payload: { error?: any; key?: string }) =>
				actions.clearAndAddHttpError({
					...payload,
					error: payload.error ? httpErrorToHuman(payload.error) : undefined,
				}),
			[actions],
		),
	};
};

const useFlashKey = (key: string): KeyedFlashStore => {
	const { addFlash, clearFlashes, clearAndAddHttpError } = useFlash();

	return useMemo(
		() => ({
			addError: (message, title) =>
				addFlash({ key, message, title, type: "error" }),
			addSuccess: (message, title) =>
				addFlash({ key, message, title, type: "success" }),
			clearFlashes: () => clearFlashes(key),
			clearAndAddHttpError: (error) => clearAndAddHttpError({ key, error }),
		}),
		[key, addFlash, clearFlashes, clearAndAddHttpError],
	);
};

export { useFlashKey };
export default useFlash;
