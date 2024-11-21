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
    planName: string,
    planAmount: number,
    discountPercentage: number,
    planType: string,

    planDuration: string,
    isRefundEnabled: "yes" | "no" | "",
    refundDays: string,
    planFeatures: PlanFeatures[]

}