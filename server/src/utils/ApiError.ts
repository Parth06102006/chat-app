class ApiError extends Error{
    public data:null;
    public statusCode:number;
    public message:string;
    public success:boolean;
    public errors?:string[]
    public stack: string | undefined
    constructor(message='Something Went Wrong',statusCode:number,errors?:string[],stack?:string |undefined)
    {
        super(message)
        this.data = null;
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace?.(this, this.constructor);
        }
        this.success = false
    }
}

export default ApiError