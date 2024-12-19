import { NextFunction, Request, Response } from "express";
import { calculatePaginationParams } from "../../utils/calculatePaginatedOffset";
import { doctor } from "../../model/doctorModel";
import { SENSITIVE_USER_FIELDS } from "../../constant";
import { patient } from "../../model/patientsModel";
interface PatientRequestQuery {
    page: number
    limit: number
    country: string
    status: string
    searchValue: string
}
export const getAllPatientsData = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, country, status, searchValue } = req.query as unknown as PatientRequestQuery
    console.log(req.query)
    try {
        const buildWhereClause: any = {};
        const { offset, limitResult } = calculatePaginationParams(page, limit)
        if (searchValue && searchValue.length > 4) {
            buildWhereClause.user_id = searchValue.trim()
        }
        if (country && country !== '') {
            buildWhereClause.country = country.trim()
        }
        if (status && status !== '') {
            buildWhereClause.speciality = status.trim()
        }
        const filterPatientQuery: any = {
            offset, limit: limitResult, order: [['created_at', 'DESC']], attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        }
        if (Object.keys(buildWhereClause).length > 0) {
            filterPatientQuery.where = buildWhereClause
        }

        const totalPatients = await patient.count()
        const { count, rows: patients } = await patient.findAndCountAll(filterPatientQuery);

        res.status(200).json({
            status: "success",
            message: "successfullu retrieved all patients details",
            totalPatients,
            totalResult: count,
            data: {
                patients: patients
            }
        })

    } catch (error) {
        next(error)
    }
}