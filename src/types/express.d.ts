declare namespace Express{
    export interface Request {
        token?: {
            exp: number,
            iat: number
            id: string,
            iss: string,
            sub: string,
            username: string
        }
    }
}