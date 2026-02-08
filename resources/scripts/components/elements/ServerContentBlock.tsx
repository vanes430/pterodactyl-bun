import type React from "react";
import type { PropsWithChildren } from "react";
import PageContentBlock, {
	type PageContentBlockProps,
} from "@/components/elements/PageContentBlock";
import { ServerContext } from "@/state/server";

interface Props extends PageContentBlockProps {
	title: string;
}

const ServerContentBlock: React.FC<PropsWithChildren<Props>> = ({
	title,
	children,
	...props
}) => {
	const name = ServerContext.useStoreState((state) => state.server.data?.name);

	return (
		<PageContentBlock title={`${name} | ${title}`} {...props}>
			{children}
		</PageContentBlock>
	);
};

export default ServerContentBlock;
