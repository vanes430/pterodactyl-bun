import { useCallback, useMemo } from "react";
import { useLocation } from "react-router";

export default () => {
	const location = useLocation();

	const getHashObject = useCallback(
		(value: string): Record<string, string> =>
			value
				.substring(1)
				.split("&")
				.reduce(
					(obj, str) => {
						const [key, value = ""] = str.split("=");

						if (str.trim()) {
							obj[key] = value;
						}

						return obj;
					},
					{} as Record<string, string>,
				),
		[],
	);

	const pathTo = (params: Record<string, string>): string => {
		const current = getHashObject(location.hash);

		for (const key in params) {
			current[key] = params[key];
		}

		return Object.keys(current)
			.map((key) => `${key}=${current[key]}`)
			.join("&");
	};

	const hash = useMemo(
		(): Record<string, string> => getHashObject(location.hash),
		[location.hash, getHashObject],
	);

	return { hash, pathTo };
};
