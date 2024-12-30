/**
* Admin Support Controller
* Handles admin responses to support tickets and support message management
* Core functionality for ticket updates and message retrieval
*/

import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../middleware/errors";
import { validateSupportRequest } from "../../../helper/helps";
import { Support } from "../../../model/admin/supportModel";
import { SupportTicket } from "../../../types";
import { TicketSystem } from "../../../model/admin/ticketSystemModel";

// Valid status values to ensure data consistency
const VALID_STATUSES = ['open', 'closed', 'pending'] as const;

/**
* Save admin's response to a support ticket
* Updates ticket status and stores the response message

*/
export const saveAdminSupportResponseDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { content, priority, subject, status, user_id, category } = req.body as SupportTicket
    const ticket_id = req.query.ticket_id as string

    try {
        // Initial validation of the ticket ID
        if (!ticket_id) {
            throw new AppError('Ticket ID is required', 400);
        }

        // Validate request data using helper function
        const isSupportRequestValid = validateSupportRequest(next, req.body)
        if (!isSupportRequestValid) return

        // Verify ticket exists in system
        const existingTicket = await TicketSystem.findOne({
            where: { ticket_id }
        });

        if (!existingTicket) {
            throw new AppError('Ticket not found', 404);
        }

        // Validate status is an acceptable value
        if (!VALID_STATUSES.includes(status)) {
            throw new AppError('Invalid ticket status provided', 400);
        }

        // Update the ticket with new content and status
        const savedTicketContent = await TicketSystem.update(
            {
                content,
                ticket_status: status,
                // Update timestamp for tracking
                updated_at: new Date()
            },
            { where: { ticket_id } }
        )

        if (!savedTicketContent[0]) {
            throw new AppError("Failed to update ticket content", 400)
        }

        // Create new support message with admin's response
        const saveAdminSupportResponse = await Support.create({
            content,
            status,
            ticket_id,
            priority,
            user_id,
            subject,
            category,
            response_time: new Date()
        })

        // Send success response with updated details
        res.status(201).json({
            status: "success",
            message: "Support message successfully sent",
            data: {
                message: saveAdminSupportResponse
            }
        })

    } catch (error) {
        // Pass errors to global error handler
        next(error)
    }
}

/**
* Retrieve support messages with pagination and filtering
* @param req Request object containing pagination parameters
* @param res Response object for sending messages
* @param next NextFunction for error handling
*/
// export const getAllAdminSupportMessage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Extract pagination parameters with defaults
//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 10;
//         const offset = (page - 1) * limit;

//         // Get messages with count for pagination
//         const supportMessages = await Support.findAndCountAll({
//             limit,
//             offset,
//             order: [['created_at', 'DESC']], // Most recent first
//             where: {
//                 // Add any additional filters here
//                 ...(req.query.status && { status: req.query.status }),
//                 ...(req.query.priority && { priority: req.query.priority })
//             }
//         });

//         // Calculate pagination metadata
//         const totalPages = Math.ceil(supportMessages.count / limit);

//         // Send response with pagination details
//         res.status(200).json({
//             status: "success",
//             data: {
//                 supportDetails: supportMessages.rows,
//                 pagination: {
//                     total: supportMessages.count,
//                     currentPage: page,
//                     totalPages,
//                     limit
//                 }
//             }
//         })
//     } catch (error) {
//         next(error)
//     }
// }