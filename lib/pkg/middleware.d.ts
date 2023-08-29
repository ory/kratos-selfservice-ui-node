import { NextFunction, Request, Response } from "express";
import { RouteOptionsCreator } from "./route";
/**
 * This middleware requires that the HTTP request has a session.
 * If the session is not present, it will redirect to the login flow.
 *
 * If a session is set but 403 is returned, a 2FA flow will be initiated.
 *
 * @param createHelpers
 */
export declare const requireAuth: (createHelpers: RouteOptionsCreator) => (req: Request, res: Response, next: NextFunction) => void;
export declare const addFavicon: (createHelpers: RouteOptionsCreator) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Sets the session in the request. If no session is found,
 * the request still succeeds.
 *
 * If a session is set but 403 is returned, a 2FA flow will be initiated.
 *
 * @param createHelpers
 */
export declare const setSession: (createHelpers: RouteOptionsCreator) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * This middleware requires that the HTTP request has no session.
 * If the session is present, it will redirect to the home page.
 *
 * @param createHelpers
 */
export declare const requireNoAuth: (createHelpers: RouteOptionsCreator) => (req: Request, res: Response, next: NextFunction) => void;
