import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { userModel } from '../models/quizModel.js'

dotenv.config()

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL)

    const email = process.env.ADMIN_EMAIL || 'admin@example.com'
    const password = process.env.ADMIN_PASSWORD || 'Admin@123'

    const existing = await userModel.findOne({ useremail: email })
    if (existing) {
      existing.role = 'admin'
      await existing.save()
      console.log('Admin updated:', email)
    } else {
      const hash = await bcrypt.hash(password, 10)
      await userModel.create({ username: 'Admin', useremail: email, password: hash, role: 'admin' })
      console.log('Admin created:', email)
    }
  } catch (e) {
    console.error(e)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

run()


