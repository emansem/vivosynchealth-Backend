// Import required dependencies
import { NextFunction, Request, Response } from "express";
import { transaction } from "../../model/transactionModel";
import { calculatePaginationParams } from "../../utils/calculatePaginatedOffset";
import moment from "moment";
import { Model, Op, Transaction } from "sequelize";
import { Transactions } from "../../types";

// Define the interface for transaction filtering parameters
interface FIlterTransaction {
    type: string;
    limit: number;
    page: number;
    status: string;
    startDate: string;
    endDate: string;
}

// Main controller function to retrieve paginated and filtered transaction data
export const getAllTransactionsData = async (req: Request, res: Response, next: NextFunction) => {
    // Extract query parameters with default values for pagination
    const {
        page = 1,
        limit = 10,
        type,
        status,
        startDate,
        endDate
    } = req.query as unknown as FIlterTransaction;

    // Calculate pagination parameters (offset and limit)
    const { limitResult, offset } = calculatePaginationParams(page as number, limit as number);


    try {
        // Initialize the base query object with pagination and sorting
        const buildQuery: any = {
            offset,
            limit: limitResult,
            order: [['created_at', 'DESC']]
        };

        // Build where clause based on filter parameters
        const whereClause = buildWhereClause(type, status, startDate, endDate);

        // Add where clause to query only if filters are present
        if (Object.keys(whereClause).length > 0) {
            buildQuery.where = whereClause;
        }

        // Fetch transactions with total count
        const { count, rows: transactions } = await transaction.findAndCountAll(buildQuery);

        const { totalRevenue, revenueDifference, todayTransactionAmount, totalTransactionsToday } = await calculateRevenueDff()

        // Send successful response with formatted data
        res.status(200).json({
            status: 'success',
            todayTransactionAmount, totalTransactionsToday,
            message: "Successfully retrieved all transactions",
            totalResult: count,
            totalRevenue,
            revenueDifference,

            data: {
                transactions
            }
        });

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
}

// Type definitions for date filtering operations
type DateOperator = typeof Op.gte | typeof Op.lte | typeof Op.between;
type DateValue = Date | [Date, Date];
type DateFilter = {
    [key in DateOperator]?: DateValue;
}

// Interface for the complete where clause structure
interface WhereClause {
    created_at?: DateFilter;
    type?: string;
    status?: string;
}

// Helper function to construct the where clause based on filter parameters
const buildWhereClause = (type: string, status: string, startDate: string, endDate: string) => {
    const whereClause = {} as WhereClause;

    // Add type filter if provided
    if (type && type !== '') {
        whereClause.type = type;
    }

    // Add status filter if provided
    if (status && status !== '') {
        whereClause.status = status;
    }

    // Handle date range filtering
    if (startDate || endDate) {
        whereClause.created_at = {};

        // Add start date filter if provided
        if (startDate) {
            const formattedStartDate = moment(startDate as string)
                .startOf("day")  // Set time to beginning of day
                .toDate();
            whereClause.created_at[Op.gte] = formattedStartDate;
        }

        // Add end date filter if provided
        if (endDate) {
            const formattedEndDate = moment(endDate as string)
                .endOf("day")    // Set time to end of day
                .toDate();
            whereClause.created_at[Op.lte] = formattedEndDate;
        }
    }

    return whereClause;
}

const getTransactionMonth = (date: string) => {
    return new Date(date).getMonth() + 1
}



/**
 * Calculates revenue differences between current and last month
 * focusing on deposit and subscription transactions.
 * Returns the percentage change and total revenue.
 */
export const calculateRevenueDff = async () => {
    // Fetch all transactions from database
    const transactions: Model<Transactions, Transactions>[] = await transaction.findAll();

    // Get current date information
    const today = new Date();
    const thisMonth = today.getMonth() + 1;
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1;
    // Filter transactions for current month
    // Only include deposits and subscriptions
    const thisMonthTransactions = transactions.filter((transaction) =>
        getTransactionMonth(transaction.dataValues.created_at) === thisMonth &&
        (transaction.dataValues.type === 'deposit' ||
            transaction.dataValues.type === 'subscription')
    );

    // Calculate total revenue for current month
    const thisMonthRevenue = thisMonthTransactions.reduce(
        (total, transaction) => total + transaction.dataValues.amount,
        0
    );

    // Filter transactions for last month
    // Bug fix: Changed thisMonth to lastMonth in the comparison
    const lastMonthTransactions = transactions.filter((transaction) =>
        getTransactionMonth(transaction.dataValues.created_at) === lastMonth &&
        (transaction.dataValues.type === 'deposit' ||
            transaction.dataValues.type === 'subscription')
    );

    // Calculate total revenue for last month
    const lastMonthRevenue = lastMonthTransactions.reduce(
        (total, transaction) => total + transaction.dataValues.amount,
        0
    );

    // Calculate total revenue across all transactions
    const totalRevenue = transactions.filter(transaction =>
    (transaction.dataValues.type === 'subscription' ||
        transaction.dataValues.type === 'deposit'))
        .reduce((acc, transaction) => acc + transaction.dataValues.amount, 0)

    // Calculate percentage change between months
    let percentage = lastMonthRevenue === 0
        ? (thisMonthRevenue > 0 ? 100 : 0)
        : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    if (percentage >= 100) {
        percentage = 100
    }
    // Calculate the simple dollar difference
    const revenueDifference = thisMonthRevenue - lastMonthRevenue;

    // Format it as a string with +/- sign
    const differenceString = revenueDifference >= 0
        ? `+${revenueDifference}`
        : `-${Math.abs(revenueDifference)}`;

    const todayDate = today.getDate();

    console.log(`Revenue change vs last month:`, todayDate);

    const getTodayDate = (date: string) => new Date(date).getDate();

    const todayTransactions = transactions.filter(transaction => getTodayDate(transaction.dataValues.created_at) === todayDate);
    const totalTransactionsToday = todayTransactions.length;
    const todayTransactionAmount = todayTransactions.reduce((total, transaction) => total + transaction.dataValues.amount, 0)

    return { revenueDifference: differenceString, totalRevenue, todayTransactionAmount, totalTransactionsToday };
};