import mongoose from "mongoose"

export const ConnectDB = async () =>{
    try {
        let connection = await mongoose.connect(process.env.MONGO_URL);
        if(connection){
            console.log(`Database Connected Successfully`);
        }
    } catch (error) {
        console.log(error);
    }
}