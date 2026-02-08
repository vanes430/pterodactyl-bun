import { transform } from "@definitions/helpers";
import type * as Models from "@definitions/user/models";
import type { UserAttributes } from "@/api/definitions/api";
import type { FractalResponseData } from "@/api/http";

export interface SSHKeyAttributes {
	name: string;
	public_key: string;
	fingerprint: string;
	created_at: string;
}

export interface ActivityLogAttributes {
	id: string;
	batch: string | null;
	event: string;
	ip: string | null;
	is_api: boolean;
	description: string | null;
	properties: Record<string, string | unknown>;
	has_additional_metadata: boolean;
	timestamp: string;
	relationships?: {
		actor?: FractalResponseData<UserAttributes>;
	};
}

export default class Transformers {
	static toSSHKey = (data: SSHKeyAttributes): Models.SSHKey => {
		return {
			name: data.name,
			publicKey: data.public_key,
			fingerprint: data.fingerprint,
			createdAt: new Date(data.created_at),
		};
	};

	static toUser = ({
		attributes,
	}: FractalResponseData<
		UserAttributes & { permissions?: string[] }
	>): Models.User => {
		return {
			uuid: attributes.uuid,
			username: attributes.username,
			email: attributes.email,
			image: attributes.image,
			twoFactorEnabled: attributes["2fa_enabled"],
			permissions: (attributes.permissions as Models.SubuserPermission[]) || [],
			createdAt: new Date(attributes.created_at),
			can(permission): boolean {
				return (this.permissions as Models.SubuserPermission[]).includes(
					permission,
				);
			},
		};
	};

	static toActivityLog = ({
		attributes,
	}: FractalResponseData<ActivityLogAttributes>): Models.ActivityLog => {
		const { actor } = attributes.relationships || {};

		return {
			id: attributes.id,
			batch: attributes.batch,
			event: attributes.event,
			ip: attributes.ip,
			isApi: attributes.is_api,
			description: attributes.description,
			properties: attributes.properties,
			hasAdditionalMetadata: attributes.has_additional_metadata ?? false,
			timestamp: new Date(attributes.timestamp),
			relationships: {
				actor: transform(
					actor as FractalResponseData<UserAttributes>,
					this.toUser,
					null,
				),
			},
		};
	};
}

export class MetaTransformers {}
