import { type Action, action } from "easy-peasy";
import { httpErrorToHuman } from "@/api/http";
import type { FlashMessageType } from "@/components/MessageBox";

export interface FlashStore {
	items: FlashMessage[];
	addFlash: Action<FlashStore, FlashMessage>;
	addError: Action<FlashStore, { message: string; key?: string }>;
	clearAndAddHttpError: Action<
		FlashStore,
		{ error?: Error | any | null; key?: string }
	>;
	clearFlashes: Action<FlashStore, string | undefined>;
}

export interface FlashMessage {
	id?: string;
	key?: string;
	type: FlashMessageType;
	title?: string;
	message: string;
}

const flashes: FlashStore = {
	items: [],

	addFlash: action((state, payload) => {
		state.items.push(payload);
	}),

	addError: action((state, payload) => {
		state.items.push({ type: "error", title: "Error", ...payload });
	}),

	clearAndAddHttpError: action((state, payload) => {
		if (!payload.error) {
			state.items = [];
		} else {
			const message = httpErrorToHuman(payload.error);

			state.items = [
				{
					type: "error",
					title: "Error",
					key: payload.key,
					message,
				},
			];
		}
	}),

	clearFlashes: action((state, payload) => {
		state.items = payload
			? state.items.filter((flashes) => flashes.key !== payload)
			: [];
	}),
};

export default flashes;
