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
    patient_id?: string,
    plan_type: "basic" | "premium" | "enterprise";
    created_at: string;
    expire_date: string | number;
    plan_id?: number,
    subscription_status: "active" | "expired" | "cancelled";
    amount: number;

    auto_renew?: boolean;
}

export interface MessageType {
    id: number,
    receiver_id: string,
    sender: string,
    content: string,
    status: string
    chatRoomId: string,
}
export interface Transactions {
    id: number
    transaction_id: string,
    amount: number,
    type: "subscription" | "withdrawal" | "deposit" | "refund";
    created_at: string
    status: "completed" | "pending" | "failed"
}

export interface UserType {
    // Personal & Professional Info
    name: string;
    email: string;
    phone_number: string;
    about: string;
    medical_license: string;
    profile_photo: string;
    years_of_experience: string;
    languages: string;
    speciality: string;
    rating: number,
    num_reviews: number,
    balance?: number | string,
    user_type?: string,
    user_id: string,
    // Location/Practice Info
    hospital_name: string;
    hospital_address: string;
    country: string;
    state: string;
    city: string;
    zip_code: string;
    gender?: "male" | "female" | 'custom' | '' | undefined
    date_of_birth?: string
    status?: string,
    working_days: string;
    created_at?: Date | number | string,
    upadted_at?: Date | number | string
}

export interface AdminSupportRequest {
    content: string,
    priority: string,
    subject: string,
    status: string,
    user_id: string
}