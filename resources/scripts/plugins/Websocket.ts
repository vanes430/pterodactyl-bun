import { EventEmitter } from "events";

export class Websocket extends EventEmitter {
	private socket: WebSocket | null = null;
	private url: string | null = null;
	private token = "";
	private reconnectTimeout: Timer | null = null;
	private retryCount = 0;
	private maxRetries = 20;

	connect(url: string): this {
		this.url = url;
		this._initialize();
		return this;
	}

	private _initialize() {
		if (!this.url) return;

		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}

		this.socket = new WebSocket(this.url);

		this.socket.onopen = () => {
			this.retryCount = 0;
			this.emit("SOCKET_OPEN");
			this.authenticate();
		};

		this.socket.onmessage = (e) => {
			try {
				const { event, args } = JSON.parse(e.data);
				args ? this.emit(event, ...args) : this.emit(event);
			} catch (ex) {
				console.warn("Failed to parse incoming websocket message.", ex);
			}
		};

		this.socket.onclose = (e) => {
			this.emit("SOCKET_CLOSE");

			// Reconnection logic
			if (e.code === 4409 || e.code === 4400) {
				this.close(1000);
			} else if (this.retryCount < this.maxRetries) {
				this.retryCount++;
				this.emit("SOCKET_RECONNECT");
				this.reconnectTimeout = setTimeout(() => this._initialize(), 1000);
			} else {
				this.emit("SOCKET_CONNECT_ERROR");
			}
		};

		this.socket.onerror = (error) => {
			this.emit("SOCKET_ERROR", error);
		};
	}

	setToken(token: string, isUpdate = false): this {
		this.token = token;
		if (isUpdate) {
			this.authenticate();
		}
		return this;
	}

	authenticate() {
		if (this.socket?.readyState === WebSocket.OPEN && this.token) {
			this.send("auth", this.token);
		}
	}

	close(code?: number, reason?: string) {
		this.url = null;
		this.token = "";
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
		this.socket?.close(code, reason);
	}

	open() {
		if (this.socket?.readyState === WebSocket.CLOSED) {
			this._initialize();
		}
	}

	reconnect() {
		this.socket?.close();
	}

	send(event: string, payload?: string | string[]) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket.send(
				JSON.stringify({
					event,
					args: Array.isArray(payload) ? payload : [payload],
				}),
			);
		}
	}
}
