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