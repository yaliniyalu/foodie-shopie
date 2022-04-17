import e, {RequestHandler} from "express";
import {NextFunction, ParamsDictionary, Request, Response} from "express-serve-static-core";

interface CustomRequest extends e.Request {
    userId: String
    user: {
        id: String
    }
}

interface CustomResponse extends e.Response {
    sendSuccess(data: object, message?: string): void
    sendError(message: string, error?: any, code?: number): void
}

interface RH extends e.RequestHandler {

}

declare global {
    type CustomRequestHandler = (req: CustomRequest, res: CustomResponse, next: e.NextFunction) => void;

    export function expressHandlerHH( req: e.Request & CustomRequest,
                                      res: e.Response & CustomResponse,
                                      next: NextFunction,): void

    export interface ExpressRequestHandler extends RequestHandler {
        (
            req: e.Request & CustomRequest,
            res: e.Response & CustomResponse,
            next: NextFunction,
        ): void;
    }


}
