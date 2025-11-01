import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import { clerkMiddleware } from '@clerk/express'

const app = express()

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get('/',(req,res)=>res.send('Server is live!'))

const PORT = process.env.PORT||5000

app.listen(PORT,()=>console.log(`Server is running on port ${PORT}`))