export const paymentData = {
    paymentTypes: [
        {
            code: "cash",
            name: "Cash",
            icon: "💵",
            iconType: "emoji",
            isPublic: true,
            createdBy: "system"
        },
        {
            code: "e_wallet",
            name: "E-Wallet",
            icon: "📱",
            iconType: "emoji",
            isPublic: true,
            createdBy: "system"
        },
        {
            code: "credit_card",
            name: "Credit Card",
            icon: "💳",
            iconType: "emoji",
            isPublic: true,
            createdBy: "system"
        },
        {
            code: "debit_card",
            name: "Debit Card",
            icon: "💳",
            iconType: "emoji",
            isPublic: true,
            createdBy: "system"
        },
        {
            code: "bank_transfer",
            name: "Bank Transfer",
            icon: "🏦",
            iconType: "emoji",
            isPublic: true,
            createdBy: "system"
        }
    ],
};


export interface PaymentData {
    paymentTypes: PaymentType[]
}

export interface PaymentType {
    code: string
    name: string
    icon: string
    iconType: string
    isPublic: boolean
    createdBy: string
}