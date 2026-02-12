import classNames from "classnames";
import debounce from "debounce";
import { ArrowBigDownDash, ChevronsRight, Send } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { theme as th } from "twin.macro";
import { type ITerminalOptions, Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { SearchAddon } from "xterm-addon-search";
import { SearchBarAddon } from "xterm-addon-search-bar";
import { Unicode11Addon } from "xterm-addon-unicode11";
import { WebLinksAddon } from "xterm-addon-web-links";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import { SocketEvent, SocketRequest } from "@/components/server/events";
import useEventListener from "@/plugins/useEventListener";
import { usePermissions } from "@/plugins/usePermissions";
import { usePersistedState } from "@/plugins/usePersistedState";
import { ScrollDownHelperAddon } from "@/plugins/XtermScrollDownHelperAddon";
import { ServerContext } from "@/state/server";

import "xterm/css/xterm.css";
import styles from "./style.module.css";

const theme = {
	background: th`colors.black`.toString(),
	cursor: "transparent",
	black: th`colors.black`.toString(),
	red: "#E54B4B",
	green: "#9ECE58",
	yellow: "#FAED70",
	blue: "#396FE2",
	magenta: "#BB80B3",
	cyan: "#2DDAFD",
	white: "#d0d0d0",
	brightBlack: "rgba(255, 255, 255, 0.2)",
	brightRed: "#FF5370",
	brightGreen: "#C3E88D",
	brightYellow: "#FFCB6B",
	brightBlue: "#82AAFF",
	brightMagenta: "#C792EA",
	brightCyan: "#89DDFF",
	brightWhite: "#ffffff",
	selection: "#FAF089",
};

const terminalProps: ITerminalOptions = {
	disableStdin: true,
	cursorStyle: "underline",
	cursorInactiveStyle: "none",
	cursorBlink: false,
	allowTransparency: true,
	fontSize: 12,
	fontFamily: th("fontFamily.mono"),
	theme: theme,
};

export default () => {
	const TERMINAL_PRELUDE =
		"\u001b[1m\u001b[33mcontainer@pterodactyl~ \u001b[0m";
	const ref = useRef<HTMLDivElement>(null);
	const terminal = useMemo(() => new Terminal({ ...terminalProps }), []);
	const fitAddon = useMemo(() => new FitAddon(), []);
	const searchAddon = useMemo(() => new SearchAddon(), []);
	const searchBar = useMemo(
		() => new SearchBarAddon({ searchAddon }),
		[searchAddon],
	);
	const webLinksAddon = useMemo(() => new WebLinksAddon(), []);
	const unicode11Addon = useMemo(() => new Unicode11Addon(), []);
	const scrollDownHelperAddon = useMemo(() => new ScrollDownHelperAddon(), []);

	const { connected, instance } = ServerContext.useStoreState(
		(state) => state.socket,
	);
	const [canSendCommands] = usePermissions(["control.console"]);
	const serverId = ServerContext.useStoreState(
		(state) => state.server.data?.id,
	);
	const isTransferring = ServerContext.useStoreState(
		(state) => state.server.data?.isTransferring,
	);
	const [history, setHistory] = usePersistedState<string[]>(
		`${serverId}:command_history`,
		[],
	);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [loading, setLoading] = useState(true);
	const [isScrolledUp, setIsScrolledUp] = useState(false);
	const status = ServerContext.useStoreState((state) => state.status.value);

	// SearchBarAddon has hardcoded z-index: 999 :(
	const zIndex = `
    .xterm-search-bar__addon {
        z-index: 10;
    }`;

	const handleConsoleOutput = useCallback(
		(line: string, prelude = false) => {
			setLoading(false);
			terminal.writeln(
				(prelude ? TERMINAL_PRELUDE : "") +
					line.replace(/(?:\r\n|\r|\n)$/im, "") +
					"\u001b[0m",
			);
		},
		[terminal],
	);

	const handleTransferStatus = useCallback(
		(status: string) => {
			switch (status) {
				// Sent by either the source or target node if a failure occurs.
				case "failure":
					terminal.writeln(`${TERMINAL_PRELUDE}Transfer has failed.\u001b[0m`);
					return;
			}
		},
		[terminal],
	);

	const handleDaemonErrorOutput = useCallback(
		(line: string) => {
			setLoading(false);
			terminal.writeln(
				TERMINAL_PRELUDE +
					"\u001b[1m\u001b[41m" +
					line.replace(/(?:\r\n|\r|\n)$/im, "") +
					"\u001b[0m",
			);
		},
		[terminal],
	);

	const handlePowerChangeEvent = useCallback(
		(state: string) => {
			setLoading(false);
			terminal.writeln(
				`${TERMINAL_PRELUDE}Server marked as ${state}...\u001b[0m`,
			);
		},
		[terminal],
	);

	const inputRef = useRef<HTMLInputElement>(null);

	const submit = (command: string) => {
		if (command.length > 0) {
			setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
			setHistoryIndex(-1);
			instance?.send("send command", command);
			if (inputRef.current) {
				inputRef.current.value = "";
			}
		}
	};

	const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowUp") {
			const newIndex = Math.min(historyIndex + 1, history?.length - 1);

			setHistoryIndex(newIndex);
			e.currentTarget.value = history?.[newIndex] || "";

			// By default up arrow will also bring the cursor to the start of the line,
			// so we'll preventDefault to keep it at the end.
			e.preventDefault();
		}

		if (e.key === "ArrowDown") {
			const newIndex = Math.max(historyIndex - 1, -1);

			setHistoryIndex(newIndex);
			e.currentTarget.value = history?.[newIndex] || "";
		}

		if (e.key === "Enter") {
			submit(e.currentTarget.value);
		}
	};

	useEffect(() => {
		if (status === "offline") {
			setLoading(false);
			return;
		}

		let timeout: NodeJS.Timeout;
		if (connected && loading) {
			timeout = setTimeout(() => setLoading(false), 1000);
		}
		return () => clearTimeout(timeout);
	}, [connected, loading, status]);

	useEffect(() => {
		if (status === "offline") {
			setLoading(false);
		}
	}, [status]);

	useEffect(() => {
		if (connected && ref.current && !terminal.element) {
			terminal.loadAddon(fitAddon);
			terminal.loadAddon(searchAddon);
			terminal.loadAddon(searchBar);
			terminal.loadAddon(webLinksAddon);
			terminal.loadAddon(unicode11Addon);
			terminal.loadAddon(scrollDownHelperAddon);

			terminal.open(ref.current);

			// Activate Unicode 11 for proper emoji and special character width handling
			terminal.unicode.activeVersion = "11";

			fitAddon.fit();
			searchBar.addNewStyle(zIndex);

			const updateScrollState = () => {
				const { viewportY, baseY } = terminal.buffer.active;
				setIsScrolledUp(viewportY < baseY - 1);
			};

			terminal.onScroll(updateScrollState);
			terminal.onLineFeed(updateScrollState);

			// Add support for capturing keys
			terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
				if ((e.ctrlKey || e.metaKey) && e.key === "c") {
					document.execCommand("copy");
					return false;
				} else if ((e.ctrlKey || e.metaKey) && e.key === "f") {
					e.preventDefault();
					searchBar.show();
					return false;
				} else if (e.key === "Escape") {
					searchBar.hidden();
				}
				return true;
			});
		}
	}, [
		terminal,
		connected,
		fitAddon,
		searchAddon,
		searchBar,
		webLinksAddon,
		unicode11Addon,
		scrollDownHelperAddon,
	]);

	useEventListener(
		"resize",
		debounce(() => {
			if (terminal.element) {
				fitAddon.fit();
			}
		}, 100),
	);

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (terminal.element) {
				fitAddon.fit();
			}
		}, 150);
		return () => clearTimeout(timeout);
	}, [terminal.element, fitAddon]);

	useEffect(() => {
		const listeners: Record<string, (s: string) => void> = {
			[SocketEvent.STATUS]: handlePowerChangeEvent,
			[SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
			[SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
			[SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
			[SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
			[SocketEvent.DAEMON_MESSAGE]: (line) => handleConsoleOutput(line, true),
			[SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
		};

		if (connected && instance) {
			// Do not clear the console if the server is being transferred.
			if (!isTransferring) {
				terminal.clear();
			}

			Object.keys(listeners).forEach((key: string) => {
				instance.addListener(key, listeners[key]);
			});
			instance.send(SocketRequest.SEND_LOGS);
		} else {
			setLoading(true);
		}

		return () => {
			if (instance) {
				Object.keys(listeners).forEach((key: string) => {
					instance.removeListener(key, listeners[key]);
				});
			}
		};
	}, [
		connected,
		instance,
		handleConsoleOutput,
		handleDaemonErrorOutput,
		handlePowerChangeEvent,
		handleTransferStatus,
		isTransferring,
		terminal,
	]);

	return (
		<div className={classNames(styles.terminal, "relative")}>
			<SpinnerOverlay
				visible={status !== "offline" && (!connected || loading)}
				size={"large"}
			/>

			<div
				className={classNames(styles.container, styles.overflows_container, {
					"rounded-b": !canSendCommands,
				})}
			>
				<div className={styles.dots}>
					<div className={styles.red} />
					<div className={styles.yellow} />
					<div className={styles.green} />
				</div>
				<div className={"h-full"}>
					<div id={styles.terminal} ref={ref} />
				</div>
				{isScrolledUp && (
					<div className={"absolute bottom-4 right-8 z-20"}>
						<button
							type={"button"}
							onClick={() => {
								terminal.scrollToBottom();
								setIsScrolledUp(false);
							}}
							className={
								"flex items-center justify-center p-2 rounded-full bg-neutral-800/80 text-cyan-400 hover:bg-neutral-700 transition-colors duration-100 shadow-lg border border-white/10"
							}
						>
							<ArrowBigDownDash size={24} />
						</button>
					</div>
				)}
			</div>
			{canSendCommands && (
				<div
					className={classNames("relative mt-2", styles.overflows_container)}
				>
					<input
						ref={inputRef}
						className={classNames("peer", styles.command_input)}
						type={"text"}
						placeholder={"Type a command..."}
						aria-label={"Console command input."}
						disabled={!instance || !connected}
						onKeyDown={handleCommandKeyDown}
						autoCorrect={"off"}
						autoCapitalize={"none"}
					/>
					<div
						className={classNames(
							"text-gray-100 peer-focus:text-gray-50 peer-focus:animate-pulse",
							styles.command_icon,
						)}
					>
						<ChevronsRight size={16} />
					</div>
					<button
						type={"button"}
						aria-label={"Send command"}
						disabled={!instance || !connected}
						onClick={() => submit(inputRef.current?.value || "")}
						className={classNames(
							"absolute right-0 top-0 h-full flex items-center px-3 text-gray-400 hover:text-cyan-400 transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed",
						)}
					>
						<Send size={18} />
					</button>
				</div>
			)}
		</div>
	);
};
