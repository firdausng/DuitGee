import {type CategoryData, categoryData} from "$lib/configuration/categories";
import {type PaymentData, paymentData} from "$lib/configuration/paymentTypes";

export const getConfigurations = async (): Promise<{
    categoryData: CategoryData,
    paymentData:PaymentData
}> => {
    return {
        categoryData,
        paymentData
    };
}
