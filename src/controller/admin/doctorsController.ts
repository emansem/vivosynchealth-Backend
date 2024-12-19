import { NextFunction, Request, Response } from "express";
import { calculatePaginationParams } from "../../utils/calculatePaginatedOffset";
import { doctor } from "../../model/doctorModel";
import { SENSITIVE_USER_FIELDS } from "../../constant";
interface DoctorRequestQuery {
    page: number
    limit: number
    country: string
    specialty: string
    searchValue: string
}
export const getAllDoctorsDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, country, specialty, searchValue } = req.query as unknown as DoctorRequestQuery
    console.log(req.query)
    try {
        const buildWhereClause: any = {};
        const { offset, limitResult } = calculatePaginationParams(page, limit)
        if (searchValue && searchValue.length > 4) {
            buildWhereClause.user_id = searchValue.trim()
        }
        if (country) {
            buildWhereClause.country = country.trim()
        }
        if (specialty) {
            buildWhereClause.speciality = specialty.trim()
        }
        const filterDoctorQuery: any = {
            offset, limit: limitResult, order: [['created_at', 'DESC']], attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        }
        if (Object.keys(buildWhereClause).length > 0) {
            filterDoctorQuery.where = buildWhereClause
        }

        const totalDoctors = await doctor.count()
        const { count, rows: doctorList } = await doctor.findAndCountAll(filterDoctorQuery);

        res.status(200).json({
            status: "success",
            message: "successfullu retrieved all doctor details",
            totalDoctors,
            totalResult: count,
            data: {
                doctors: doctorList
            }
        })

    } catch (error) {
        next(error)
    }
}