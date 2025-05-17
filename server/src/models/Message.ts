import mongoose,{Schema} from "mongoose";

interface messageSchemaProps{
    senderId:any,
    receiverId:any,
    text:string,
    image:string,
    seen:boolean,
}

const messageSchema = new Schema<messageSchemaProps>({
    senderId:{type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        ,required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true},
    text:{type:String},
    image:{type:String},
    seen:{type:Boolean,default:false}
},{timestamps:true})

const Message = mongoose.model('Message',messageSchema)
export default Message