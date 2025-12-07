import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };


export const slugify = (...args: string[]): string => {
    const value = args.join(' ')

    return value
        .normalize('NFD') // split an accented letter in the base letter and the acent
        .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
        .replace(/\s+/g, '-') // separator
}

/**
 * Converts a UTC ISO string to local datetime-local format (YYYY-MM-DDTHH:mm)
 * for use with HTML datetime-local inputs
 *
 * Uses date-fns for consistent date handling across the application.
 *
 * @param utcIsoString - UTC date in ISO format (e.g., "2025-12-08T10:30:00.000Z")
 * @returns Local datetime string (e.g., "2025-12-08T18:30")
 */
export const utcToLocalDatetimeString = (utcIsoString: string): string => {
    const date = parseISO(utcIsoString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Converts a local datetime-local string to UTC ISO format
 * for sending to the API
 *
 * Uses native toISOString() to ensure consistent UTC format with 'Z' suffix.
 *
 * @param localDatetime - Local datetime string (e.g., "2025-12-08T18:30")
 * @returns UTC ISO string (e.g., "2025-12-08T10:30:00.000Z")
 */
export const localDatetimeToUtcIso = (localDatetime: string): string => {
    const date = new Date(localDatetime);
    return date.toISOString();
};

/**
 * Formats a Date object to local datetime-local format (YYYY-MM-DDTHH:mm)
 * for use with HTML datetime-local inputs
 *
 * Uses date-fns for consistent date handling across the application.
 *
 * @param date - Date object or ISO string
 * @returns Local datetime string (e.g., "2025-12-08T18:30")
 */
export const formatDatetimeLocal = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, "yyyy-MM-dd'T'HH:mm");
};