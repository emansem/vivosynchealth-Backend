/**
* Support and ticketing system controller
* Handles ticket creation, responses, and management for patient support system
* Includes functions for creating tickets, saving responses, and retrieving messages
*/

import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../middleware/errors";
import { generateTicketId, validateSupportRequest } from "../../../helper/helps";
import { Support } from "../../../model/admin/supportModel";
import { SupportTicket } from "../../../types";
import { TicketSystem } from "../../../model/admin/ticketSystemModel";

// Interface defining required fields for creating a new support ticket
interface CreateTicket {
    category: string,
    subject: string,
    content: string
    prority: string
}

// Enum for ticket status to maintain consistency
const TICKET_STATUS = {
    CLOSE: "closed",
    OPEN: "open",
}

/**
* Creates a new support ticket for a user
* Checks for existing open tickets in same category to prevent duplicates
* Generates unique ticket ID and saves ticket details in system
*/
export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;
    const { category, subject, content, prority } = req.body as CreateTicket
    try {
        // Check if user has existing open ticket in same category
        const ticketDetails = await TicketSystem.findOne({ where: { user_id } });
        const isTicketCatagorySame = ticketDetails?.dataValues.catagory === category &&
            ticketDetails.dataValues.ticket_status === TICKET_STATUS.OPEN

        // Prevent duplicate open tickets in same category
        if (isTicketCatagorySame) {
            throw new AppError(
                `You already have a open ticket Id :${ticketDetails.dataValues.ticket_id} open`,
                400
            )
        }

        // Generate unique ticket ID and create ticket record
        const ticketId = generateTicketId()
        const createTicketDetails = await TicketSystem.create({
            category,
            content,
            ticket_status: TICKET_STATUS.OPEN,
            prority,
            user_id,
            ticket_id: ticketId,
            subject
        })

        if (!createTicketDetails) {
            throw new AppError("An error occured trying to create your ticket", 400);
        }

        // Save initial support message along with ticket
        const saveTicketMessage = await Support.create({
            category,
            content,
            status: TICKET_STATUS.OPEN,
            prority,
            user_id,
            ticket_id: ticketId,
            subject
        })

        // Return success response with ticket details
        res.status(201).json({
            status: "success",
            message: `Ticket Number :${ticketId} successfully created`,
            data: {
                details: saveTicketMessage
            }
        })

    } catch (error) {
        next(error)
    }
}

/**
* Saves response details for an existing support ticket
* Updates ticket status and adds new response message
* Used by admin/staff to respond to support requests
*/
export const savePatientSupportResponeDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { content, priority, subject, status, user_id } = req.body as SupportTicket
    const ticket_id = req.query as unknown as string

    try {
        // Validate incoming request data
        const isSupportRequestValid = validateSupportRequest(next, req.body)
        if (!isSupportRequestValid) return

        // Update existing ticket with new details
        const savedTicketContent = await TicketSystem.update(
            { content, ticket_status: status, priority },
            { where: { ticket_id } }
        )

        if (!savedTicketContent) {
            throw new AppError("Error saving ticket content", 400)
        }

        // Save new support response message
        const saveSupportResponse = await Support.create({
            content,
            status,
            ticket_id,
            priority,
            user_id,
            subject
        })

        if (saveSupportResponse) {
            // Return success response
            res.status(201).json({
                status: "success",
                message: "Support message successfully sent",
                data: {
                    message: saveSupportResponse
                }
            })
        } else {
            throw new AppError('An error occured saving support response', 400)
        }

    } catch (error) {
        next(error)
    }
}

/**
* Retrieves all support messages from the system
* Used by admin to view complete support history
*/
// export const getAllAdminSupportMessage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // Fetch all support messages
//         const supportMessage = await Support.findAll();

//         // Return messages in response
//         res.status(200).json({
//             status: "success",
//             data: {
//                 supportDetails: supportMessage
//             }
//         })
//     } catch (error) {
//         next(error)
//     }
// }