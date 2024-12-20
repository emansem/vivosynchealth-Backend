// Import necessary dependencies
import { NextFunction, Request, Response } from "express";
import { doctor } from "../../model/doctorModel";
import { SENSITIVE_USER_FIELDS } from "../../constant";
import { patient } from "../../model/patientsModel";
import { subscription } from "../../model/subscriptionModel";
import { Model, Op } from "sequelize";
import { SubscriptionData, UserType } from "../../types";
import { calculateMontlyDates, getMonthDate, getMonthlyDateRange } from "../../helper/date";
import { calculatePerecentageDff } from "../../helper/helps";
import { transaction } from "../../model/transactionModel";
import { Support } from "../../model/supportModel";

// Define interfaces for better type safety and code documentation
interface DoctorStats {
    totalDoctorsDff: number;
    doctorsPecentage: number;
    totalDoctors: number;
}

interface PatientStats {
    totalPatientsDff: number;
    patientPercentage: number;
    totalPatients: number;
}

interface SubscriptionStats {
    totalSubscriptionsDff: number;
    activeSubscriptionPercentage: number;
    activeSubscriptions: Model<SubscriptionData, SubscriptionData>[];
    expiredSubscriptions: number;
    cancelledSubscriptions: number;
}

interface RecentData {
    doctorsAndPatients: Model<UserType, UserType>[];
    recentTransactions: Model<any, any>[];
    recentSupportTickets: Model<any, any>[];
}

/**
 * Main controller function for the admin dashboard
 * Aggregates all necessary data including doctors, patients, subscriptions, and recent activities
 */
export const getAllAdminDashboardData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fetch all required metrics in parallel for better performance
        const doctors = await calculateDoctorsMonthlyDff(next)
        const patients = await calculatePatientsMonthlyDff(next)
        const subscriptions = await calculateSubscriptionMonthlyDff(next)
        const recentData = await getRecentDetails(next)

        // Structure and send response with all dashboard metrics
        res.status(200).json({
            status: "success",
            data: {
                doctors: {
                    totaDoctors: doctors?.doctorsPecentage,
                    doctorsPercentage: doctors?.doctorsPecentage,
                    doctorsDff: doctors?.totalDoctorsDff
                },
                patients: {
                    totalPatients: patients?.totalPatients,
                    patientPercentage: patients?.patientPercentage,
                    totalPatientsDff: patients?.totalPatientsDff
                },
                subscriptions: {
                    totalActiveSub: subscriptions?.activeSubscriptions,
                    activeSubPercentage: subscriptions?.activeSubscriptionPercentage,
                    totalActiveSubDff: subscriptions?.totalSubscriptionsDff,
                    totalExpiredSUb: subscriptions?.expiredSubscriptions,
                    totalCancelledSub: subscriptions?.cancelledSubscriptions,
                },
                recentData: {
                    recentTransactions: recentData?.recentTransactions,
                    recentSupportTicket: recentData?.recentSupportTickets,
                    recentDoctorsAndPatients: recentData?.doctorsAndPatients
                }
            }
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Calculates month-over-month changes in doctor registrations
 * Compares current month with previous month and calculates growth metrics
 */
const calculateDoctorsMonthlyDff = async (next: NextFunction): Promise<DoctorStats | undefined> => {
    try {
        // Get date ranges for comparison
        const { lastMonth, thisMonth, startOfLastMonth, endOfThisMonth } = calculateMontlyDates()

        // Query doctors within the date range, excluding sensitive fields
        const { count: totalDoctors, rows: doctors } = await doctor.findAndCountAll({
            where: {
                created_at: {
                    [Op.between]: [startOfLastMonth, endOfThisMonth]
                }
            },
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        });

        // Filter doctors based on their registration month
        const thisMonthDoctors = doctors.filter(doctor =>
            getMonthDate(doctor.dataValues.created_at as string) === thisMonth);
        const lastMonthDoctors = doctors.filter(doctor =>
            getMonthDate(doctor.dataValues.created_at as string) === lastMonth);

        // Calculate growth metrics
        const totalDoctorThisMonth = thisMonthDoctors.length;
        const totalLastMonthDoctors = lastMonthDoctors.length;
        const totalDoctorsDff = totalDoctorThisMonth - totalLastMonthDoctors;

        // Calculate percentage change with edge case handling
        const { percentage } = calculatePerecentageDff(totalDoctorsDff, totalLastMonthDoctors, totalDoctorThisMonth);

        return { totalDoctorsDff, doctorsPecentage: percentage, totalDoctors };
    } catch (error) {
        next(error);
        return undefined;
    }
}

/**
 * Calculates month-over-month changes in patient registrations
 
 */
const calculatePatientsMonthlyDff = async (next: NextFunction): Promise<PatientStats | undefined> => {
    try {
        const { lastMonth, thisMonth, startOfLastMonth, endOfThisMonth } = calculateMontlyDates()

        // Query patients within date range
        const { count: totalPatients, rows: patients } = await patient.findAndCountAll({
            where: {
                created_at: {
                    [Op.between]: [startOfLastMonth, endOfThisMonth]
                }
            },
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        });

        // Filter and calculate patient metrics
        const thisMonthPatients = patients.filter(patient =>
            getMonthDate(patient.dataValues.created_at as string) === thisMonth);
        const lastMonthPatients = patients.filter(patient =>
            getMonthDate(patient.dataValues.created_at as string) === lastMonth);

        const totalPatientsThisMonth = thisMonthPatients.length;
        const totalPatientsLastMonth = lastMonthPatients.length;
        const totalPatientsDff = totalPatientsThisMonth - totalPatientsLastMonth;

        const { percentage } = calculatePerecentageDff(totalPatientsDff, totalPatientsLastMonth, totalPatientsThisMonth);

        return { totalPatientsDff, patientPercentage: percentage, totalPatients };
    } catch (error) {
        next(error);
        return undefined;
    }
}

/**
 * Calculates subscription metrics with additional status-based filtering
 * Tracks active, expired, and cancelled subscriptions
 */
const calculateSubscriptionMonthlyDff = async (next: NextFunction): Promise<SubscriptionStats | undefined> => {
    try {
        const { lastMonth, thisMonth } = calculateMontlyDates()

        // Fetch all subscriptions
        const { rows: subscriptions } = await subscription.findAndCountAll({
            attributes: {
                exclude: SENSITIVE_USER_FIELDS
            }
        });

        // Categorize subscriptions by status and creation date
        const thisMonthSubscriptions = subscriptions.filter(subscription =>
            getMonthDate(subscription.dataValues.created_at as string) === thisMonth &&
            subscription.dataValues.subscription_status === 'active'
        );
        const lastMonthSubscriptions = subscriptions.filter(subscription =>
            getMonthDate(subscription.dataValues.created_at as string) === lastMonth &&
            subscription.dataValues.subscription_status === 'active'
        );

        // Get counts for different subscription statuses
        const cancelledSubscriptions = subscriptions.filter(subscription =>
            subscription.dataValues.subscription_status === "cancelled"
        );
        const expiredSubscriptions = subscriptions.filter(subscription =>
            subscription.dataValues.subscription_status === "expired"
        );
        const activeSubscriptions = subscriptions.filter(subscription =>
            subscription.dataValues.subscription_status === "active"
        );

        // Calculate growth metrics
        const totalThisMonthSubscriptions = thisMonthSubscriptions.length;
        const totalLastMonthSubscriptions = lastMonthSubscriptions.length;
        const totalSubscriptionsDff = totalThisMonthSubscriptions - totalLastMonthSubscriptions;

        const { percentage } = calculatePerecentageDff(
            totalSubscriptionsDff,
            totalLastMonthSubscriptions,
            totalThisMonthSubscriptions
        );

        return {
            totalSubscriptionsDff,
            activeSubscriptionPercentage: percentage,
            activeSubscriptions,
            expiredSubscriptions: expiredSubscriptions.length,
            cancelledSubscriptions: cancelledSubscriptions.length
        };
    } catch (error) {
        next(error);
        return undefined;
    }
}

/**
 * Fetches recent activities across different modules for dashboard display
 * Includes recent transactions, support tickets, and user registrations
 */
const getRecentDetails = async (next: NextFunction): Promise<RecentData | undefined> => {
    try {
        // Get most recent transactions
        const recentTransactions = await transaction.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });

        // Get most recent support tickets
        const recentSupportTickets = await Support.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });

        // Get recent user registrations (both doctors and patients)
        const recentPatients = await patient.findAll({
            limit: 2,
            order: [['created_at', 'DESC']],
            attributes: { exclude: SENSITIVE_USER_FIELDS }
        });
        const recentDoctors = await doctor.findAll({
            limit: 3,
            order: [['created_at', 'DESC']],
            attributes: { exclude: SENSITIVE_USER_FIELDS }
        });

        // Combine doctors and patients for unified activity feed
        const doctorsAndPatients = recentDoctors.concat(recentPatients);

        return { doctorsAndPatients, recentTransactions, recentSupportTickets };
    } catch (error) {
        next(error);
        return undefined;
    }
}