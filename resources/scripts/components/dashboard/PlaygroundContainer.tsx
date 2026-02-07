import {
	AlertTriangle,
	Archive,
	CalendarDays,
	Clock,
	Cpu,
	Database,
	Edit,
	Eye,
	FileDown,
	FileText,
	Folder,
	HardDrive,
	LayoutDashboard,
	Lock,
	LogOut,
	MemoryStick,
	Network,
	PackageOpen,
	Power,
	Search,
	Server,
	Settings,
	Trash2,
	Unlock,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import tw from "twin.macro";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/elements/button/index";
import Code from "@/components/elements/Code";
import { Dialog } from "@/components/elements/dialog";
import ConfirmationDialog from "@/components/elements/dialog/ConfirmationDialog";
import PageContentBlock from "@/components/elements/PageContentBlock";
import Skeleton from "@/components/elements/Skeleton";

const Section = ({
	title,
	code,
	children,
}: {
	title: string;
	code?: string;
	children: React.ReactNode;
}) => (
	<section css={tw`mb-12`}>
		<h3
			css={tw`text-xl font-header mb-4 border-b border-neutral-700 pb-2 text-neutral-100`}
		>
			{title}
		</h3>
		<div css={tw`grid grid-cols-1 gap-6`}>
			<div>{children}</div>
			{code && (
				<div css={tw`bg-black/50 rounded-lg p-4 border border-neutral-800`}>
					<p css={tw`text-2xs uppercase text-neutral-500 font-bold mb-2`}>
						Usage Example
					</p>
					<pre css={tw`text-xs text-blue-300 font-mono overflow-x-auto`}>
						{code}
					</pre>
				</div>
			)}
		</div>
	</section>
);

export default () => {
	const [toggle, setToggle] = useState(false);
	const [visible, setVisible] = useState(false);
	const [confirmVisible, setConfirmVisible] = useState(false);

	return (
		<PageContentBlock title={"Developer Playground"}>
			<div css={tw`max-w-5xl mx-auto`}>
				<header css={tw`mb-10`}>
					<h2 css={tw`text-3xl font-header text-neutral-100 mb-2`}>
						UI Component Laboratory
					</h2>
					<p css={tw`text-neutral-400`}>
						A comprehensive documentation and playground for Pterodactyl
						components.
					</p>
				</header>

				<Section
					title={"Buttons & Actions"}
					code={`<Button>Primary</Button>\n<Button variant={Button.Variants.Secondary}>Secondary</Button>\n<Button.Danger>Danger</Button.Danger>\n<Button isLoading={true}>Loading</Button>`}
				>
					<div css={tw`grid grid-cols-1 md:grid-cols-2 gap-8`}>
						<div css={tw`space-y-4`}>
							<p css={tw`text-xs uppercase text-neutral-500 font-bold mb-2`}>
								Standard Variants
							</p>
							<div css={tw`flex flex-wrap gap-4`}>
								<Button>Primary Action</Button>
								<Button variant={Button.Variants.Secondary}>Secondary</Button>
								<Button.Danger>Danger Action</Button.Danger>
								<Button.Text>Text Link</Button.Text>
							</div>
						</div>
						<div css={tw`space-y-4`}>
							<p css={tw`text-xs uppercase text-neutral-500 font-bold mb-2`}>
								Sizes & States
							</p>
							<div css={tw`flex flex-wrap gap-4 items-center`}>
								<Button size={Button.Sizes.Small}>Small</Button>
								<Button size={Button.Sizes.Large}>Large</Button>
								<Button isLoading={true}>Loading</Button>
								<Button disabled>Disabled</Button>
							</div>
						</div>
					</div>
				</Section>

				<Section
					title={"Lucide Icons Showcase"}
					code={`import { LayoutDashboard, Server, Cpu } from 'lucide-react';\n\n<LayoutDashboard size={20} />`}
				>
					<div
						css={tw`grid grid-cols-4 md:grid-cols-8 gap-4 bg-neutral-800 p-6 rounded-lg border border-neutral-700`}
					>
						<LayoutDashboard className="text-neutral-400" />
						<Settings className="text-neutral-400" />
						<LogOut className="text-neutral-400" />
						<Search className="text-neutral-400" />
						<Server className="text-neutral-400" />
						<Network className="text-neutral-400" />
						<Cpu className="text-neutral-400" />
						<MemoryStick className="text-neutral-400" />
						<HardDrive className="text-neutral-400" />
						<Folder className="text-blue-400" />
						<FileText className="text-neutral-400" />
						<FileDown className="text-green-400" />
						<Trash2 className="text-red-400" />
						<Edit className="text-yellow-400" />
						<Lock className="text-yellow-500" />
						<Unlock className="text-neutral-400" />
						<Archive className="text-neutral-400" />
						<PackageOpen className="text-neutral-400" />
						<Database className="text-neutral-400" />
						<Eye className="text-neutral-400" />
						<CalendarDays className="text-neutral-400" />
						<Clock className="text-neutral-400" />
						<Power className="text-red-400" />
						<AlertTriangle className="text-orange-400" />
					</div>
				</Section>

				<Section
					title={"Avatars"}
					code={`<Avatar name="username" />\n<Avatar.User /> // Automatic from state`}
				>
					<div
						css={tw`bg-neutral-800 p-6 rounded-lg border border-neutral-700 max-w-sm`}
					>
						<div css={tw`flex items-center space-x-4`}>
							<Avatar.User className={"w-12 h-12"} />
							<Avatar name={"pterodactyl"} className={"w-12 h-12"} />
							<Avatar name={"random-seed"} className={"w-12 h-12"} />
						</div>
					</div>
				</Section>

				<Section
					title={"Modals & Dialogs"}
					code={`<Dialog visible={open} onClose={() => setOpen(false)} title="Title">\n  Content\n</Dialog>`}
				>
					<div css={tw`flex flex-wrap gap-4`}>
						<Button onClick={() => setVisible(true)}>Open Basic Dialog</Button>
						<Button.Danger onClick={() => setConfirmVisible(true)}>
							Open Confirmation
						</Button.Danger>
					</div>

					<Dialog
						open={visible}
						onClose={() => setVisible(false)}
						title={"Sample Dialog"}
						description={"This is what a basic modal dialog looks like."}
					>
						<div css={tw`mt-6 space-y-4`}>
							<p css={tw`text-neutral-300`}>You can put any content here.</p>
							<Code dark>console.log("Hello!");</Code>
						</div>
						<Dialog.Footer>
							<Button.Text onClick={() => setVisible(false)}>Close</Button.Text>
							<Button onClick={() => setVisible(false)}>Understood</Button>
						</Dialog.Footer>
					</Dialog>

					<ConfirmationDialog
						open={confirmVisible}
						onClose={() => setConfirmVisible(false)}
						title={"Critical Action"}
						confirm={"Yes, Delete Everything"}
						onConfirmed={() => setConfirmVisible(false)}
					>
						Are you sure you want to perform this action?
					</ConfirmationDialog>
				</Section>

				<Section
					title={"Skeleton Loading"}
					code={`<Skeleton width="100%" height="1rem" />\n<Skeleton circle width="40px" height="40px" />`}
				>
					<div
						css={tw`bg-neutral-800 p-6 rounded-lg border border-neutral-700 max-w-lg`}
					>
						<div css={tw`flex items-center mb-4`}>
							<Skeleton
								circle
								width={"40px"}
								height={"40px"}
								className={"mr-4"}
							/>
							<div css={tw`flex-1`}>
								<Skeleton width={"40%"} height={"1rem"} className={"mb-2"} />
								<Skeleton width={"25%"} height={"0.75rem"} />
							</div>
						</div>
						<div css={tw`space-y-3`}>
							<Skeleton width={"100%"} height={"1rem"} />
							<Skeleton width={"80%"} height={"1rem"} />
						</div>
					</div>
				</Section>

				<Section
					title={"Code Typography"}
					code={`<Code>npm install</Code>\n<Code dark>git push</Code>`}
				>
					<div
						css={tw`p-4 bg-neutral-900 rounded border border-neutral-700 max-w-lg`}
					>
						<p css={tw`text-neutral-200`}>
							Install via <Code>apt install</Code> or use{" "}
							<Code dark>docker compose</Code>.
						</p>
					</div>
				</Section>
			</div>
		</PageContentBlock>
	);
};
