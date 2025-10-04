import {categoryData} from "$lib/configuration/categories";
import type {Category} from "$lib/schemas/expense";

export const getCategories = async (): Promise<Category[]> => {
    // const publicCategories = await kv.get<CategoryData>(PUBLIC_CATEGORIES_CACHE_KEY, 'json');
    // if(publicCategories){
    //     return publicCategories.categories;
    // }
    //
    // await kv.put(PUBLIC_CATEGORIES_CACHE_KEY, JSON.stringify(categoryData));
    return categoryData.categories;
}

export const getCategory = async (categoryName: string): Promise<Category|null|undefined> => {
    return categoryData.categories.find(category => category.name === categoryName);
}
