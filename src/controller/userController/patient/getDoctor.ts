import { Request, Response, NextFunction } from "express";
import { doctor } from "../../../model/doctorModel";
import { AppError } from "../../../middleware/errors";
import { SENSITIVE_USER_FIELDS } from "../../../constant";
import { Op, Sequelize } from "sequelize";

interface FilterTypes {
    city: string;
    country: string;
    specialization: string;
    state: string;
}

interface QueryResult {
    success: boolean;
    data?: {
        doctors: any[];
        totalDoctors: number;
        totalPages: number;
        currentPage: number;
    };
    error?: string;
}

/**
 * Builds the search conditions for the doctor query
 * @param searchValue The search term to look for
 * @returns Sequelize condition object for searching across multiple columns
 */
// const buildSearchConditions = (searchValue: string) => {
//     const searchLower = searchValue.trim().toLowerCase();
//     const searchColumns = ['name', 'about', 'speciality'];

//     return {
//         [Op.or]: searchColumns.map(column =>
//             Sequelize.where(
//                 Sequelize.fn('LOWER', Sequelize.col(column)),
//                 Op.like,
//                 `%${searchLower}%`
//             )
//         )
//     };
// };


/**
 * Creates a comprehensive where clause for doctor search and filtering
 * Combines specialty, country, rating filters with search in a logical way
 */
const buildWhereClause = (filters: any) => {
    const { specialty, country, rating, searchValue } = filters;
    let whereConditions: any = {};

    // Create an array to hold our AND conditions
    const andConditions: any[] = [];

    // Handle specialty filter
    if (specialty && specialty !== 'all') {
        andConditions.push({ speciality: specialty });
    }

    // Handle country filter
    if (country && country !== 'all') {
        andConditions.push({ country: country });
    }

    // Handle rating filter
    if (rating) {
        const ratingValue = parseFloat(rating);
        if (!isNaN(ratingValue) && ratingValue >= 0 && ratingValue <= 5) {
            andConditions.push({
                rating: {
                    [Op.gte]: ratingValue  // Using greater than or equal to
                }
            });
        }
    }

    // Handle search across multiple fields
    if (searchValue?.trim() && searchValue.length >= 3) {
        const searchLower = searchValue.trim().toLowerCase();
        andConditions.push({
            [Op.or]: [
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('name')),
                    Op.like,
                    `%${searchLower}%`
                ),
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('about')),
                    Op.like,
                    `%${searchLower}%`
                ),
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('speciality')),
                    Op.like,
                    `%${searchLower}%`
                )
            ]
        });
    }

    // If we have any conditions, combine them with AND
    if (andConditions.length > 0) {
        whereConditions = {
            [Op.and]: andConditions
        };
    }

    // Debug logging to help understand the query structure
    console.log('Filter conditions:', {
        specialty,
        country,
        rating,
        searchValue
    });
    console.log('Generated where clause:', JSON.stringify(whereConditions, null, 2));

    return whereConditions;
};


/**
 * Main controller for getting all doctors with filtering and pagination
 */
export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extract and validate query parameters
        const {
            specialty,
            searchValue,
            country,
            rating,
            page = '1',
            limit = '10'
        } = req.query as any;

        const pageNumber = parseInt(page);
        const limitResult = parseInt(limit);

        // Validate page number
        if (pageNumber <= 0 || isNaN(pageNumber)) {
            throw new AppError("Invalid page number", 400);
        }

        // 2. Build query components
        const offset = (pageNumber - 1) * limitResult;
        const whereClause = buildWhereClause({ specialty, country, rating, searchValue });

        console.log('search conditions', whereClause)

        // 3. Execute query with pagination and filtering
        const { count, rows: doctors } = await doctor.findAndCountAll({
            where: whereClause,
            limit: limitResult,
            offset,
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        });

        console.log("countng", count)

        // 4. Format and send response
        // IMPORTANT: Single response point to prevent multiple headers sent
        res.status(200).json({
            totalDoctors: count,
            totalPages: Math.ceil(count / limitResult),
            currentPage: pageNumber,
            data: {
                doctors: doctors || []
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};
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