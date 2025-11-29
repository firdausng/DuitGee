import {formatISO} from "date-fns";
import {UTCDate} from "@date-fns/utc";

export interface AuditContext {
	userId: string;
	timestamp?: string;
}

export interface CreateAuditFields {
	createdBy: string;
	createdAt: string;
}

export interface UpdateAuditFields {
	updatedBy: string;
	updatedAt: string;
}

export interface DeleteAuditFields {
	deletedBy: string;
	deletedAt: string;
}

/**
 * Generate audit fields for record creation
 * Microservice-compatible: Uses userId as string without FK constraints
 * Timestamps are stored in UTC format (ISO 8601 with Z suffix)
 */
export function createAuditFields(context: AuditContext): CreateAuditFields {
	const timestamp = context.timestamp || formatISO(new UTCDate());
	return {
		createdBy: context.userId,
		createdAt: timestamp
	};
}

/**
 * Generate audit fields for record updates
 * Microservice-compatible: Uses userId as string without FK constraints
 * Timestamps are stored in UTC format (ISO 8601 with Z suffix)
 */
export function updateAuditFields(context: AuditContext): UpdateAuditFields {
    const timestamp = context.timestamp || formatISO(new UTCDate());
	return {
		updatedBy: context.userId,
		updatedAt: timestamp
	};
}

/**
 * Generate audit fields for record deletion (soft delete)
 * Microservice-compatible: Uses userId as string without FK constraints
 * Timestamps are stored in UTC format (ISO 8601 with Z suffix)
 */
export function deleteAuditFields(context: AuditContext): DeleteAuditFields {
    const timestamp = context.timestamp || formatISO(new UTCDate());
	return {
		deletedBy: context.userId,
		deletedAt: timestamp
	};
}

/**
 * Merge create and update audit fields for initial record creation
 */
export function initialAuditFields(context: AuditContext): CreateAuditFields & UpdateAuditFields {
	return {
		...createAuditFields(context),
		...updateAuditFields(context)
	};
}