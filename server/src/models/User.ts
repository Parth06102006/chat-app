import mongoose,{Schema} from "mongoose"

interface userSchemaProps{
    email:string,
    password:string,
    fullname:string,
    profilePic:string,
    bio:string,
}

const userSchema = new Schema<userSchemaProps>({
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,minlength:6},
    fullname:{type:String,required:true},
    profilePic:{type:String,default:''},
    bio:{type:String}
},{timestamps:true})

const User = mongoose.model('User',userSchema)
export default User