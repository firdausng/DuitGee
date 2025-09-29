import { formatISO } from 'date-fns';

export interface AuditContext {
	userId: string;
	timestamp?: Date;
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
 */
export function createAuditFields(context: AuditContext): CreateAuditFields {
	const timestamp = context.timestamp || new Date();
	return {
		createdBy: context.userId,
		createdAt: formatISO(timestamp)
	};
}

/**
 * Generate audit fields for record updates
 * Microservice-compatible: Uses userId as string without FK constraints
 */
export function updateAuditFields(context: AuditContext): UpdateAuditFields {
	const timestamp = context.timestamp || new Date();
	return {
		updatedBy: context.userId,
		updatedAt: formatISO(timestamp)
	};
}

/**
 * Generate audit fields for record deletion (soft delete)
 * Microservice-compatible: Uses userId as string without FK constraints
 */
export function deleteAuditFields(context: AuditContext): DeleteAuditFields {
	const timestamp = context.timestamp || new Date();
	return {
		deletedBy: context.userId,
		deletedAt: formatISO(timestamp)
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