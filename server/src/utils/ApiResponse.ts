class ApiResponse<T>{
    public data:T|undefined;
    public statusCode?:number;
    public message:string;
    public success:boolean;
    constructor(message='Successful',data?:T,statusCode?:number,success:boolean = true)
    {
        if(data)
        {
            this.data = data;
        }
        this.statusCode = statusCode;
        this.message = message;
        this.success = success;
    }
}

export default ApiResponse