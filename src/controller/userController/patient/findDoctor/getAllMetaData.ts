import { Request, Response, NextFunction } from "express"
import { Specialty } from "../../../../model/specialtiesModel";
import { Countries } from "../../../../model/countriesModel";
import { Availability } from "../../../../model/availabilityModel";

/**
 * Fetches application metadata: specialties, countries, and availability.
 * Used for populating dropdowns and filters across the application.
 */
export const fetchApplicationMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Fetch all reference data concurrently
        const [specialties, countries, availability] = await Promise.all([
            Specialty.findAll(),
            Countries.findAll(),
            Availability.findAll()
        ]);

        res.status(200).json({
            status: "success",
            message: "Successfully retrieved application metadata",
            data: {
                specialties,
                countries,
                availability,
            }
        });
    } catch (error) {
        next(error);
    }
};