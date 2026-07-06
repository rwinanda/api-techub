export class NotFoundError extends Error {
    constructor(message, errorCode){
        super(message);
        this.status = 404;
        this.name = 'NotFoundError';
        this.errorCode = errorCode || "91";
    };
}

export class ValidationError extends Error {
    constructor(message, errorCode){
        super(message);
        this.status = 400;
        this.name = 'ValidationError';
        this.errorCode = errorCode || "91";
    };
}

export class ConflictError extends Error {
    constructor(message, errorCode){
        super(message);
        this.status = 409;
        this.name = 'ConflictError';
        this.errorCode = errorCode || "91";
    };
}

export class AuthorizationError extends Error {
    constructor(message, errorCode){
        super(message);
        this.status = 401;
        this.name = 'AuthorizationError';
        this.errorCode = errorCode || "91";
    }
}