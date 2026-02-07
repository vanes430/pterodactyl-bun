import { AlertTriangle } from "lucide-react";
import React from "react";
import tw from "twin.macro";

interface State {
	hasError: boolean;
}

// eslint-disable-next-line @typescript-eslint/ban-types
class ErrorBoundary extends React.Component<{}, State> {
	state: State = {
		hasError: false,
	};

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: Error) {
		console.error(error);
	}

	render() {
		return this.state.hasError ? (
			<div css={tw`flex items-center justify-center w-full my-4`}>
				<div
					css={tw`flex items-center bg-neutral-900 rounded p-3 text-red-500`}
				>
					<AlertTriangle size={16} className={"mr-2"} />
					<p css={tw`text-sm text-neutral-100`}>
						An error was encountered by the application while rendering this
						view. Try refreshing the page.
					</p>
				</div>
			</div>
		) : (
			this.props.children
		);
	}
}

export default ErrorBoundary;