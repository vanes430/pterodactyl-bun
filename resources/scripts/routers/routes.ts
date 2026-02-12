import type React from "react";
import { lazy } from "react";

const AccountApiContainer = lazy(
	() => import("@/components/dashboard/AccountApiContainer"),
);
const AccountOverviewContainer = lazy(
	() => import("@/components/dashboard/AccountOverviewContainer"),
);
const ActivityLogContainer = lazy(
	() => import("@/components/dashboard/activity/ActivityLogContainer"),
);
const AccountSSHContainer = lazy(
	() => import("@/components/dashboard/ssh/AccountSSHContainer"),
);
const BackupContainer = lazy(
	() => import("@/components/server/backups/BackupContainer"),
);
const ServerConsole = lazy(
	() => import("@/components/server/console/ServerConsoleContainer"),
);
const DatabasesContainer = lazy(
	() => import("@/components/server/databases/DatabasesContainer"),
);
const FileManagerContainer = lazy(
	() => import("@/components/server/files/FileManagerContainer"),
);
const NetworkContainer = lazy(
	() => import("@/components/server/network/NetworkContainer"),
);
const ServerActivityLogContainer = lazy(
	() => import("@/components/server/ServerActivityLogContainer"),
);
const ScheduleContainer = lazy(
	() => import("@/components/server/schedules/ScheduleContainer"),
);
const SettingsContainer = lazy(
	() => import("@/components/server/settings/SettingsContainer"),
);
const StartupContainer = lazy(
	() => import("@/components/server/startup/StartupContainer"),
);
const UsersContainer = lazy(
	() => import("@/components/server/users/UsersContainer"),
);

// Each of the router files is already code split out appropriately — so
// all of the items above will only be loaded in when that router is loaded.
//
// These specific lazy loaded routes are to avoid loading in heavy screens
// for the server dashboard when they're only needed for specific instances.
const FileEditContainer = lazy(
	() => import("@/components/server/files/FileEditContainer"),
);
const ScheduleEditContainer = lazy(
	() => import("@/components/server/schedules/ScheduleEditContainer"),
);

interface RouteDefinition {
	path: string;
	// If undefined is passed this route is still rendered into the router itself
	// but no navigation link is displayed in the sub-navigation menu.
	name: string | undefined;
	component: React.ComponentType;
	exact?: boolean;
}

interface ServerRouteDefinition extends RouteDefinition {
	permission: string | string[] | null;
}

interface Routes {
	// All of the routes available under "/account"
	account: RouteDefinition[];
	// All of the routes available under "/server/:id"
	server: ServerRouteDefinition[];
}

export default {
	account: [
		{
			path: "/",
			name: "Account",
			component: AccountOverviewContainer,
			exact: true,
		},
		{
			path: "/api",
			name: "API Credentials",
			component: AccountApiContainer,
		},
		{
			path: "/ssh",
			name: "SSH Keys",
			component: AccountSSHContainer,
		},
		{
			path: "/activity",
			name: "Activity",
			component: ActivityLogContainer,
		},
	],
	server: [
		{
			path: "/",
			permission: null,
			name: "Console",
			component: ServerConsole,
			exact: true,
		},
		{
			path: "/files",
			permission: "file.*",
			name: "Files",
			component: FileManagerContainer,
		},
		{
			path: "/files/:action",
			permission: "file.*",
			name: undefined,
			component: FileEditContainer,
		},
		{
			path: "/databases",
			permission: "database.*",
			name: "Databases",
			component: DatabasesContainer,
		},
		{
			path: "/schedules",
			permission: "schedule.*",
			name: "Schedules",
			component: ScheduleContainer,
		},
		{
			path: "/schedules/:id",
			permission: "schedule.*",
			name: undefined,
			component: ScheduleEditContainer,
		},
		{
			path: "/users",
			permission: "user.*",
			name: "Users",
			component: UsersContainer,
		},
		{
			path: "/backups",
			permission: "backup.*",
			name: "Backups",
			component: BackupContainer,
		},
		{
			path: "/network",
			permission: "allocation.*",
			name: "Network",
			component: NetworkContainer,
		},
		{
			path: "/startup",
			permission: "startup.*",
			name: "Startup",
			component: StartupContainer,
		},
		{
			path: "/settings",
			permission: ["settings.*", "file.sftp"],
			name: "Settings",
			component: SettingsContainer,
		},
		{
			path: "/activity",
			permission: "activity.*",
			name: "Activity",
			component: ServerActivityLogContainer,
		},
	],
} as Routes;
