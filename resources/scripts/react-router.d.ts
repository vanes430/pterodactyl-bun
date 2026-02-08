import type * as React from "react";

declare module "react-router-dom" {
	export class Route<
		T extends {} = {},
		Path extends string = string,
	> extends React.Component<
		RouteProps<Path> & Omit<T, keyof RouteProps>,
		any
	> {}
	export class Switch extends React.Component<SwitchProps, any> {}
	export class Redirect extends React.Component<RedirectProps, any> {}
	export class Link<S = unknown> extends React.Component<
		LinkProps<S> & React.RefAttributes<HTMLAnchorElement>,
		any
	> {}
	export class NavLink<S = unknown> extends React.Component<
		NavLinkProps<S> & React.RefAttributes<HTMLAnchorElement>,
		any
	> {}
}
