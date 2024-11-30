export interface DoctorOnboardingData {
    // Personal & Professional Info
    about: string;
    medical_license: string;
    profile_photo: string;
    years_of_experience: string;
    languages: string;
    speciality: string,

    // Location/Practice Info
    hospital_name: string;
    hospital_address: string;
    country: string;
    state: string;
    city: string;
    zip_code: string;
    working_days: string;
}

//Register field types

export interface RegisterField {
    email: string;
    password: string;
    name: string
    phone: string
    gender?: string;
    user_type: string
}
export type PlanFeatures = {
    id: number;
    value: string;
};
export interface SubscriptionPlanDataType {
    name: string,
    amount: number,
    doctor_id?: string,
    discount_percentage: number,
    plan_type: "basic" | "standard" | "premium"
    plan_duration: "30" | "1",
    isRefundEnabled: "yes" | "no" | "",
    refund_period: string,
    plan_status: "active" | "inactive",
    plan_features: PlanFeatures[]

}


export interface ResendLinkRequest {
    email?: string;
    token?: string;
    subject: 'VERIFY_EMAIL' | 'RESET_PASSWORD';
}

export interface WithdrawalAccountData {
    bank_name: string;
    account_name: string;
    account_number: number;
    withdrawal_password: string;
}

export interface SubscriptionData {
    id: number;
    doctor_name?: string;
    doctor_id: string;
    plan_type: "basic" | "premium" | "enterprise";
    created_at: string;
    expire_date: string | number;
    plan_id?: number,
    subscription_status: "active" | "expired" | "cancelled";
    amount: number;

    auto_renew?: boolean;
}