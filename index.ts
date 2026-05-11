import express from "express";
import {z}  from "zod";
import {prisma} from "./db.ts";
import jwt from "jsonwebtoken";



const app=express();
app.use(express.json())



const SignupSchema=z.object({
    email:z.email(),
    password:z.string().min(6),
    name:z.string(),
    role:z.enum(["INSTRUCTOR","STUDENT"])

})
app.post('/signup',async(req,res)=>{
    const result=SignupSchema.safeParse(req.body);
    if(!result.success){
        res.status(400).json({
            message:"Invalid schema"
        })
    }else{
        const userExists=await prisma.user.findUnique({
            where:{email:result.data.email},
        })
        if(userExists){
            return res.status(400).json({
                message:"User already exists"
            })
        }
        else{
            const user=await prisma.user.create({
                data:result.data,
                select:{
                    name:true,
                    email:true,
                    role:true
                }

            
            })
              res.json({
                message: "Signup successful",
                    user
                });
}
    }
}
)

const LoginSchema=z.object({
    email:z.email(),
    password:z.string()

})

app.post("/login",async(req,res)=>{
    const result=LoginSchema.safeParse(req.body);
       if(!result.success){
        res.status(400).json({
            message:"Invalid schema"
        })
    }
        else{
            const user=await prisma.user.findUnique({
                where:{email:result.data.email}
            })
           
            

            if(user){
              
                const token=jwt.sign({
                    "email":user.email,
                    "id":user.id,
                    "role":user.role
                },
                process.env.SECRET_KEY!

                )
                res.status(200).json({
                    message:"Login successful",
                    token:token
                })
            }
            else{
                res.status(400).json({
                    message:"User does not exist"
                })
            }
            
        }

})

    app.listen(3000, () => {
  console.log("Server running on port 3000");
});
