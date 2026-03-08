import express from 'express'
import cors from 'cors'
import 'dotenv/config'


import connectDB from './config/mongodb.js'


// ---------------- APP CONFIG ----------------
const app = express()
const port = process.env.PORT || 5000

connectDB()


// ---------------- MIDDLEWARE ----------------
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text({ type: 'text/plain' }))
app.use(cors())



// ---------------- HEALTH CHECK ----------------
app.get('/', (req, res) => {
  res.send('API Working')
})

// ---------------- START SERVER ----------------
app.listen(port, () => {
  console.log(`Server started on PORT : ${port}`)
})