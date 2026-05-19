import express from "express";
import {z}  from "zod";
import {prisma} from "./db.ts";
import jwt from "jsonwebtoken";
import {hash,compare} from "bcrypt";
import  { authMiddleware } from "./middleware.ts";
import type { AuthenticatedRequest } from "./middleware.ts";
import { parse } from "node:path";



const app=express();
app.use(express.json())



const SignupSchema=z.object({
    email:z.email(),
    password:z.string().min(6),
    name:z.string(),
    role:z.enum(["INSTRUCTOR","STUDENT"]).default("STUDENT")

})
app.post('/auth/signup',async(req,res)=>{
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

app.post("/auth/login",async(req,res)=>{
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


const CreateCourseSchema=z.object({
    title:z.string(),
    description:z.string().optional(),
    price:z.number().positive()
})
app.post("/courses",authMiddleware,async(req:AuthenticatedRequest,res)=>{
    const userRole=req.role
    const userId =req.id
    const parsedData=CreateCourseSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.json({
            message:"Invalid schema"
        })
    }
    if(userRole==="INSTRUCTOR"&& userId){
        const data=parsedData.data;
        const createCourse=await prisma.course.create({
            data:{title:data.title,
                description:data.description,
                price:data.price,
                instructorId:userId
            },
            select:{
                title:true,
                description:true,
                price:true
            }
        })
        return res.json({
            course:{
                createCourse
            },
            message:"Coures Created successful"
        })
    }
    return res.json({
        message:"Invalid Request"
    })
})

app.get('/courses',async(req,res)=>{
    const allCourses=await prisma.course.findMany({
        select:{
            title:true,
            description:true,
            price:true
        }
    }) 
    return res.json({
        courses:allCourses
    })
})

app.delete('/courses/:id',authMiddleware,async(req:AuthenticatedRequest,res)=>{
    const userId=req.id;
    const userRole=req.role;
    const courseId=req.params.id as string;
    if(userRole==="INSTRUCTOR"&& userId){
        const course=await prisma.course.findMany({
            where:{AND:[
                {instructorId:userId},
                {id:courseId}
            ]}
        })
        
        if(course.length>0){
            const deleteCourse=await prisma.$transaction([
                prisma.lesson.deleteMany({
                    where:{courseId:courseId}
                }),
                prisma.course.delete({
                    where:{id:courseId}
                }),
                

            ])
            return res.json({
                message:"Course deleted successfully"
            })

        }else{
            return res.json({
                message:"Course does not exist"
            })
        }
    }else{
        return res.json({
            message:"Invalid request"
        })
    }
})

app.patch('/courses/:id',authMiddleware,async(req:AuthenticatedRequest,res)=>{
    const parsedData=CreateCourseSchema.safeParse(req.body)
        if(!parsedData.success){
        return res.json({
            message:"Invalid schema"
        })
    }else{
    const data=parsedData.data;
    const userId=req.id;
    const userRole=req.role;
    const courseId=req.params.id as string
    if(userRole==="INSTRUCTOR"&& userId){
           const course=await prisma.course.findMany({
            where:{AND:[
                {instructorId:userId},
                {id:courseId}
            ]}
        })
    if(course.length>0){
        const updateCourse=await prisma.course.update({
            where:{id:courseId},
            data:{
                title:data.title,
                description:data.description,
                price:data.price
            }
        })
        return res.json({
            message:"Updatad successfully"
        })
    }else{
        return res.json({
            message:"Course does not exist"

        })
    }
    }else{
        return res.json({
            message:"Invalid Request"
        })
    }
}
})


const CreateLessonSchema=z.object({
    title:z.string(),
    content:z.string(),
    courseId:z.string()


})
app.post('/lessons',authMiddleware,async(req:AuthenticatedRequest,res)=>{
    const parsedData=CreateLessonSchema.safeParse(req.body)
    
    if(!parsedData.success){
        return res.json({
            message:"Invaild schema"
        })
    }
    const userRole=req.role
    const userId=req.id
    if(userRole==="INSTRUCTOR"&& userId){
        const data=parsedData.data
        const adminCourse=await prisma.course.findUnique({
            where:{id:data.courseId},
            select:{
               instructorId:true
            }
        })
        if(!adminCourse){
            return res.json({
                message:"Course does not exist"
            })
        }else{
        const id=adminCourse.instructorId
        if(id===userId){
           const CreateLesson=await prisma.lesson.create({
            data:{
                title:data.title,
                content:data.content,
                courseId:data.courseId

            }
        })
        return res.json({
            message:"Lesson created successfully"
        })
        }
    }
        
    }else{
        return res.json({
            message:"Invalid Request"
        })
    }


})


app.get('/courses/:courseId/lessons',async(req,res)=>{
    const courseId=req.params.courseId
    const allLesson=await prisma.lesson.findMany({
        where:{courseId:courseId},
        select:{
            title:true,
            course:{select:{title:true}
            }
        }
        
    })
    const courseName=allLesson[0].course.title
    const lessons=allLesson.map(l=>l.title)
    return res.json({
        "Course":courseName,
        "lessons":lessons
    })

})




app.listen(3000, () => {
  console.log("Server running on port 3000");
});


