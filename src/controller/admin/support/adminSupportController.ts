import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../middleware/errors";
import { validateSupportRequest } from "../../../helper/helps";
import { Support } from "../../../model/admin/supportModel";
import { AdminSupportRequest } from "../../../types";
import { TicketSystem } from "../../../model/admin/ticketSystemModel";

export const saveAdminSupportResponeDetails = async (req: Request, res: Response, next: NextFunction) => {

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