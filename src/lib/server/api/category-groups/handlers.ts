import {categoryData} from "$lib/configuration/categories";
import type {CategoryGroup, CategoryGroupWithCategories} from "$lib/schemas/expense";

export const getCategoryGroups = async (): Promise<CategoryGroup[]> => {
	return categoryData.categoryGroups;
};

export const getCategoryGroup = async (categoryName: string): Promise<CategoryGroup|null|undefined> => {
    return categoryData.categoryGroups.find(group => group.name === categoryName);
};

export const getCategoryGroupsWithCategories = async ():Promise<CategoryGroupWithCategories[]> => {
    const categoryGroupWithCategories = categoryData.categoryGroups
        .map(group => ({
            ...group,
            categories: categoryData.categories.filter(c =>
                c.group.includes(group.name)
            )
        }));

	return Object.values(categoryGroupWithCategories);
};