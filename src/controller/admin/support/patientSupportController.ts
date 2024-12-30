import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../middleware/errors";
import { generateTicketId, validateSupportRequest } from "../../../helper/helps";
import { Support } from "../../../model/admin/supportModel";
import { AdminSupportRequest } from "../../../types";
import { TicketSystem } from "../../../model/admin/ticketSystemModel";
interface CreateTicket {
    catagory: string,
    subject: string,
    content: string
    prority: string
}

const TICKET_STAUS = {
    CLOSE: "closed",
    OPEN: "open",

}

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
    const user_id = (req as any).user;
    const { catagory, subject, content, prority } = req.body as CreateTicket
    try {
        const ticketDetails = await TicketSystem.findOne({ where: { user_id } });
        const isTicketCatagorySame = ticketDetails?.dataValues.catagory === catagory && ticketDetails.dataValues.ticket_status === TICKET_STAUS.OPEN
        if (isTicketCatagorySame) throw new AppError(`You already have a open ticket Id :${ticketDetails.dataValues.ticket_id} open`, 400)
        const ticketId = generateTicketId()
        const createTicketDetails = await TicketSystem.create({ catagory, content, ticket_status: TICKET_STAUS.OPEN, prority, user_id, ticked_id: ticketId, })
        if (!createTicketDetails) throw new AppError("An error occured trying to create your ticket", 400);

        const saveTicketMessage = await Support.create({ catagory, content, status: TICKET_STAUS.OPEN, prority, user_id, ticked_id: ticketId, subject })

    } catch (error) {

    }
}

export const savePatientSupportResponeDetails = async (req: Request, res: Response, next: NextFunction) => {

    const { content, priority, subject, status, user_id } = req.body as AdminSupportRequest
    const ticket_id = req.query as unknown as string
    try {
        //Validate the request data types
        const isSupportRequestValid = validateSupportRequest(next, req.body)

        if (!isSupportRequestValid) return

        const savedTickedContent = await TicketSystem.update(
            { content, status, ticket_id, ticked_status: status, priority, user_id, subject },
            { where: { ticket_id } })

        if (!savedTickedContent) throw new AppError("Error saving ticked content", 400)

        const saveAdminSupportRespone = await Support.create({ content, status, ticket_id, priority, user_id, subject })

        if (saveAdminSupportRespone) {
            res.status(201).json({
                status: "success",
                message: "Support message successfully sent",
                data: {
                    message: saveAdminSupportRespone
                }
            })
        } else {
            throw new AppError('An error occured saving support response', 400)
        }


    } catch (error) {
        next(error)
    }
}



export const getAllAdminSupportMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const supportMessage = await Support.findAll();
        res.status(200).json({
            status: "success",
            data: {
                supportDetails: supportMessage
            }
        })
    } catch (error) {
        next(error)
    }
}