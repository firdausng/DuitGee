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
    paymentProviders : [
        // Indonesia - E-Wallets
        {
            id: "pp_gopay",
            name: "GoPay",
            type: "e_wallet",
            icon: "💚",
            iconType: "emoji",
            color: "#00AA13",
            isPublic: true,
        },
        {
            id: "pp_ovo",
            name: "OVO",
            type: "e_wallet",
            icon: "💜",
            iconType: "emoji",
            color: "#4C3494",
            isPublic: true,
        },
        {
            id: "pp_dana",
            name: "Dana",
            type: "e_wallet",
            icon: "💙",
            iconType: "emoji",
            color: "#118EEA",
            isPublic: true,
        },
        {
            id: "pp_shopeepay",
            name: "ShopeePay",
            type: "e_wallet",
            icon: "🧡",
            iconType: "emoji",
            color: "#EE4D2D",
            isPublic: true,
        },
        {
            id: "pp_linkaja",
            name: "LinkAja",
            type: "e_wallet",
            icon: "❤️",
            iconType: "emoji",
            color: "#E31E24",
            isPublic: true,
        },

        // Indonesia - Banks
        {
            id: "pp_bca",
            name: "BCA",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#003B71",
            isPublic: true,
        },
        {
            id: "pp_mandiri",
            name: "Mandiri",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#003D79",
            isPublic: true,
        },
        {
            id: "pp_bni",
            name: "BNI",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#F47920",
            isPublic: true,
        },
        {
            id: "pp_bri",
            name: "BRI",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#003B71",
            isPublic: true,
        },
        {
            id: "pp_permata",
            name: "Permata",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#8CC63F",
            isPublic: true,
        },
        {
            id: "pp_cimb",
            name: "CIMB",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#D0006F",
            isPublic: true,
        },

        // Malaysia - Major Banks
        {
            id: "pp_maybank",
            name: "Maybank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#FFD700",
            isPublic: true,
        },
        {
            id: "pp_cimb_my",
            name: "CIMB Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#D0006F",
            isPublic: true,
        },
        {
            id: "pp_publicbank",
            name: "Public Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#E31837",
            isPublic: true,
        },
        {
            id: "pp_rhb",
            name: "RHB Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#003B71",
            isPublic: true,
        },
        {
            id: "pp_hongleong",
            name: "Hong Leong Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#003B71",
            isPublic: true,
        },
        {
            id: "pp_ambank",
            name: "AmBank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#FF6600",
            isPublic: true,
        },
        {
            id: "pp_uob",
            name: "UOB Malaysia",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#0B2D82",
            isPublic: true,
        },
        {
            id: "pp_ocbc",
            name: "OCBC Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#ED1C24",
            isPublic: true,
        },
        {
            id: "pp_hsbc_my",
            name: "HSBC Malaysia",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#DB0011",
            isPublic: true,
        },
        {
            id: "pp_standardchartered",
            name: "Standard Chartered",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#007A33",
            isPublic: true,
        },

        // Malaysia - Islamic Banks
        {
            id: "pp_bankislam",
            name: "Bank Islam",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#007B5F",
            isPublic: true,
        },
        {
            id: "pp_cimbislamic",
            name: "CIMB Islamic",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#008542",
            isPublic: true,
        },
        {
            id: "pp_maybankislamic",
            name: "Maybank Islamic",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#00A651",
            isPublic: true,
        },
        {
            id: "pp_rhbislamic",
            name: "RHB Islamic",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#006633",
            isPublic: true,
        },
        {
            id: "pp_publicislamic",
            name: "Public Islamic Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#007A33",
            isPublic: true,
        },

        // Malaysia - Other Banks
        {
            id: "pp_affin",
            name: "Affin Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#D71920",
            isPublic: true,
        },
        {
            id: "pp_alliancebank",
            name: "Alliance Bank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#E30613",
            isPublic: true,
        },
        {
            id: "pp_bsn",
            name: "Bank Simpanan Nasional",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#003B71",
            isPublic: true,
        },
        {
            id: "pp_muamalat",
            name: "Bank Muamalat",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#005F32",
            isPublic: true,
        },
        {
            id: "pp_agrobank",
            name: "Agrobank",
            type: "bank",
            icon: "🏦",
            iconType: "emoji",
            color: "#8BC53F",
            isPublic: true,
        },

        // Malaysia - E-Wallets
        {
            id: "pp_tng",
            name: "Touch 'n Go eWallet",
            type: "e_wallet",
            icon: "💙",
            iconType: "emoji",
            color: "#0055A5",
            isPublic: true,
        },
        {
            id: "pp_boost",
            name: "Boost",
            type: "e_wallet",
            icon: "💜",
            iconType: "emoji",
            color: "#6441A5",
            isPublic: true,
        },
        {
            id: "pp_grabpay",
            name: "GrabPay",
            type: "e_wallet",
            icon: "💚",
            iconType: "emoji",
            color: "#00B14F",
            isPublic: true,
        },
        {
            id: "pp_mcash",
            name: "MAE by Maybank",
            type: "e_wallet",
            icon: "🟡",
            iconType: "emoji",
            color: "#FFD700",
            isPublic: true,
        },
        {
            id: "pp_bigpay",
            name: "BigPay",
            type: "e_wallet",
            icon: "🔵",
            iconType: "emoji",
            color: "#0066FF",
            isPublic: true,
        },
    ]
};


export interface PaymentData {
    paymentTypes: PaymentType[]
    paymentProviders: PaymentProvider[]
}

export interface PaymentType {
    code: string
    name: string
    icon: string
    iconType: string
    isPublic: boolean
    createdBy: string
}

export interface PaymentProvider {
    id: string
    name: string
    type: string
    icon: string
    iconType: string
    color: string
    isPublic: boolean
}