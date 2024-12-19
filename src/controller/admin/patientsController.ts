import { NextFunction, Request, Response } from "express";
import { calculatePaginationParams } from "../../utils/calculatePaginatedOffset";
import { doctor } from "../../model/doctorModel";
import { SENSITIVE_USER_FIELDS } from "../../constant";
import { patient } from "../../model/patientsModel";
import { AppError } from "../../middleware/errors";
import { transaction } from "../../model/transactionModel";

// Types for request query parameters
interface PatientRequestQuery {
    page: number
    limit: number
    country: string
    status: string
    searchValue: string
}

// Interface for patient details update
interface PatientDetails {
    profile_photo: string,
    name: string,
    phone_number: string,
    email: string,
    country: string,
    status: string,
    balance: string
    date_of_birth: string
}

/**
 * Fetch all patients data with pagination and filtering
 * @param req Express request object containing query parameters
 * @param res Express response object
 * @param next Express next function
 */
export const getAllPatientsData = async (req: Request, res: Response, next: NextFunction) => {
    // Extract query parameters with defaults
    const { page = 1, limit = 10, country, status, searchValue } = req.query as unknown as PatientRequestQuery

    try {
        // Initialize where clause for filtering
        const buildWhereClause: any = {};
        const { offset, limitResult } = calculatePaginationParams(page, limit)

        // Build where clause based on search criteria
        if (searchValue && searchValue.length > 4) {
            buildWhereClause.user_id = searchValue.trim()
        }
        if (country && country !== '') {
            buildWhereClause.country = country.trim()
        }
        if (status && status !== '') {
            buildWhereClause.speciality = status.trim()
        }

        // Configure query for paginated results
        const filterPatientQuery: any = {
            offset,
            limit: limitResult,
            order: [['created_at', 'DESC']],
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        }

        // Configure query for mobile view (no pagination)
        const PATIENT_MOBILE_QUERY: any = {
            order: [['created_at', 'DESC']],
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        }

        // Apply where clause if filters exist
        if (Object.keys(buildWhereClause).length > 0) {
            filterPatientQuery.where = buildWhereClause
            PATIENT_MOBILE_QUERY.where = buildWhereClause
        }

        // Fetch total counts and filtered data
        const totalPatients = await patient.count()
        const { count, rows: patients } = await patient.findAndCountAll(filterPatientQuery);
        const mobilePatientListData = await patient.findAll(PATIENT_MOBILE_QUERY);

        // Get active/inactive patient counts
        const patientsData = await patient.findAll({
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        })
        const activePatients = patientsData.filter(patient => patient.dataValues.status === 'active')
        const inactivePatients = patientsData.filter(patient => patient.dataValues.status === 'inactive')

        // Send successful response
        res.status(200).json({
            status: "success",
            message: "Successfully retrieved all patients details",
            totalPatients,
            totalResult: count,
            activePatients: activePatients.length,
            inactivePatients: inactivePatients.length,
            data: {
                patients: patients,
                mobilePatientListData,
            }
        })

    } catch (error) {
        next(error)
    }
}

/**
 * Get detailed information for a specific patient
 * @param req Express request object containing patient_id parameter
 * @param res Express response object
 * @param next Express next function
 */
export const getPatientDetails = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.params.patient_id
    try {
        // Validate patient ID
        if (!user_id) {
            throw new AppError("Please provide patient id", 400);
        }

        // Fetch patient details excluding sensitive fields
        const patientDetails = await patient.findOne({
            where: { user_id },
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        })

        // Fetch recent transactions for the patient
        const transactions = await transaction.findAll({
            where: { patient_id: user_id },
            limit: 7,
            order: [['created_at', 'DESC']]
        })

        // Handle case where patient is not found
        if (!patientDetails) {
            throw new AppError("No patient found with this id", 400);
        }

        // Send successful response
        res.status(200).json({
            status: "success",
            data: {
                transactions,
                patientDetails,
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Update patient details
 * @param req Express request object containing patient_id parameter and update data
 * @param res Express response object
 * @param next Express next function
 */
export const updatePatientDetails = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.params.patient_id
    const { country, name, phone_number, email, date_of_birth, status, balance } = req.body as PatientDetails

    try {
        // Update patient record
        const updatedData = await patient.update(
            { country, name, phone_number, email, date_of_birth, status, balance },
            { where: { user_id } }
        )

        // Handle update failure
        if (!updatedData) throw new AppError("Error updating patient details", 400)

        // Send successful response
        res.status(200).json({
            status: 'success',
            message: "Successfully updated patient details"
        })
    } catch (error) {
        next(error)
    }
}