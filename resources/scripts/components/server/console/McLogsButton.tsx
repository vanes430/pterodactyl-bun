import { ExternalLink, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import tw from "twin.macro";
import getFileContents from "@/api/server/files/getFileContents";
import loadDirectory from "@/api/server/files/loadDirectory";
import { Button } from "@/components/elements/button/index";
import Spinner from "@/components/elements/Spinner";
import useFlash from "@/plugins/useFlash";
import { ServerContext } from "@/state/server";

const McLogsButton = () => {
	const [visible, setVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
	const { addFlash, clearFlashes } = useFlash();

	useEffect(() => {
		if (!uuid) return;

		loadDirectory(uuid, "logs")
			.then((files) => {
				const hasLatestLog = files.some(
					(f) => f.isFile && f.name.toLowerCase() === "latest.log",
				);
				setVisible(hasLatestLog);
			})
			.catch(() => setVisible(false));
	}, [uuid]);

	const onClick = async () => {
		if (!uuid) return;

		setLoading(true);
		clearFlashes("mclogs");

		try {
			const content = await getFileContents(uuid, "logs/latest.log");

			const formData = new URLSearchParams();
			formData.append("content", content);

			const response = await fetch("https://api.mclo.gs/1/log", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				window.open(data.url, "_blank");
				addFlash({
					type: "success",
					key: "mclogs",
					message: "Log has been uploaded successfully to mclogs.com",
				});
			} else {
				throw new Error(data.error || "Failed to upload log to mclogs.");
			}
		} catch (error) {
			console.error(error);
			addFlash({
				type: "error",
				key: "mclogs",
				message:
					error instanceof Error ? error.message : "Failed to upload log.",
			});
		} finally {
			setLoading(false);
		}
	};

	if (!visible) return null;

	return (
		<Button
			color={"primary"}
			size={Button.Sizes.Small}
			css={tw`flex items-center ml-4 bg-cyan-600/20! text-cyan-400! border-cyan-500/20! hover:bg-cyan-600/30!`}
			onClick={onClick}
			disabled={loading}
		>
			{loading ? <Spinner size={"small"} /> : <Share2 size={14} />}
			<span css={tw`hidden sm:inline ml-2`}>Upload Log</span>
			{!loading && (
				<ExternalLink size={12} css={tw`ml-2 opacity-50 hidden sm:inline`} />
			)}
		</Button>
	);
};

export default McLogsButton;
