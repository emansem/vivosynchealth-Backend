import { Request, Response, NextFunction } from "express"
import { doctor } from "../../../model/doctorModel"
import { AppError } from "../../../middleware/errors";
import { SENSITIVE_USER_FIELDS } from "../../../constant";
interface FilterTypes {
    city: string;
    country: string;
    specialization: string;
    state: string
}
//find all doctors from the database and sent
export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { city, specialization, country, state, page = 1, limit = 10 } = req.query as any;
        const pageNUmber = parseInt(page)
        const limitResult = parseInt(limit);
        if (page <= 0 || isNaN(page)) {
            throw new AppError("Please provid a valid page number", 400);
        }
        const offset = (pageNUmber - 1) * limitResult;
        // const filter = filterDoctors(state, country, specialization, city);
        const totalDoctors = await doctor.count();
        const validateResponse = await validateTotalPages(totalDoctors, res, pageNUmber, limitResult, next);
        if (!validateResponse) return
        const doctors = await doctor.findAll(
            {
                offset,
                limit: limitResult,
                attributes:
                {
                    exclude: SENSITIVE_USER_FIELDS

                }
            }
        );
        if (!doctors || doctors.length <= 0) {
            throw new AppError('No doctors found', 400);
        }
        console.log(doctors)
        res.status(200).json({

            totalItems: doctors.length,
            totalPages: Math.ceil(totalDoctors / limitResult),
            currentPage: page,
            data: {
                doctors
            }
        })


    } catch (error) {
        next(error)

    }
}

//Validate if the page number is greater than the total number of pages in the database.

const validateTotalPages = async (totalDoctors: number, res: Response, page: number, limit: number, next: NextFunction) => {
    try {
        const totalPages = Math.ceil(totalDoctors / limit)
        if (totalPages < page) {
            res.status(200).json({
                totalItems: totalDoctors,
                totalPages,
                currentPage: page,
                doctors: []
            })

        }
        return true;
    } catch (error) {
        next(error)
        return false;
    }
}

const filterDoctors = (state: string, country: string, specialization: string, city: string) => {
    const filter: any = {};
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (specialization) filter.specialization = specialization
    if (city) filter.city = city;

    return filter;
}

//find doctors by id from the database
export const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
    const doctorId = req.params.doctorId
    try {
        if (!doctorId) {
            throw new AppError("Invalid id, please provid a valid id", 400);
        }
        const doctorData = await doctor.findOne({
            where: { user_id: doctorId }, attributes: {
                exclude: SENSITIVE_USER_FIELDS

            }
        });
        res.status(200).json({
            status: "Success",
            data: {
                doctor: doctorData,

            }
        })
    } catch (error) {
        next(error)
    }
}