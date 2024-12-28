import { NextFunction, Request, Response } from "express";
import { GeneralSettings } from "../../model/admin/GeneralSettings";

export const getGeneralSettingsDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const generalSettingsDetails = await GeneralSettings.findByPk(1)
        res.status(200).json({
            status: "success",
            data: {
                settings: generalSettingsDetails
            }
        })
    } catch (error) {
        next(error)
    }
}


interface GeneralSettings {
    websiteName: string;
    tagline: string;
    metaDescription: string;
    metaKeywords: string;
    patientFee: string;
    doctorCommission: string;
    subscriptionDuration: 'monthly' | 'yearly' | 'weekly';
    status: 'active' | 'suspended' | 'maintenance';
    supportEmail: string;
    supportPhone: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export const updateGeneralSettings = async (req: Request, res: Response, next: NextFunction) => {
    const {
        websiteName,
        tagline,
        metaDescription,
        metaKeywords,
        patientFee,
        doctorCommission,
        subscriptionDuration,
        status,
        supportEmail,
        supportPhone
    } = req.body as GeneralSettings;

    try {
        const updateDetails = await GeneralSettings.update({
            website_name: websiteName,
            website_tagline: tagline,
            meta_description: metaDescription,
            meta_keywords: metaKeywords,
            patient_fee: patientFee,
            doctor_commission: doctorCommission,
            subscription_duration: subscriptionDuration,
            website_status: status,
            suport_email: supportEmail,  // Note: keeping the typo as per DB structure
            support_phone: supportPhone,
            updated_at: new Date()
        }, { where: { id: 1 } });

        res.status(200).json({
            success: true,
            message: "General settings updated successfully",

        });

    } catch (error) {
        next(error);
    }
};