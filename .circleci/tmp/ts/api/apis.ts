export * from './adminApi';
import { AdminApi } from './adminApi';
export * from './commonApi';
import { CommonApi } from './commonApi';
export * from './healthApi';
import { HealthApi } from './healthApi';
export * from './publicApi';
import { PublicApi } from './publicApi';
export * from './versionApi';
import { VersionApi } from './versionApi';
import * as fs from 'fs';
import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;

export const APIS = [AdminApi, CommonApi, HealthApi, PublicApi, VersionApi];
