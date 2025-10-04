import {paymentData} from "$lib/configuration/paymentTypes";

export const getPaymentTypes = async () => {
	return paymentData.paymentTypes;
};

export const getPaymentProviders = async (type?: string) => {
    let providers = paymentData.paymentProviders;
    if(type){
        providers = paymentData.paymentProviders.filter(p => p.type === type);
    }
    return providers.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPaymentProvidersByName = async (name: string) => {
    return paymentData.paymentProviders.find(p => p.name === name);
};
