const express = require("express")
const cors = require("cors")
const session = require("express-session")
const { MongoClient } = require("mongodb")

const app = express()
const PORT = 3000

// ===== Middleware =====
app.use(express.json())

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(session({
  secret: "stepwise-secret",
  resave: false,
  saveUninitialized: false
}))

// ===== MongoDB =====
const uri = "mongodb://admin:1145141919810@ac-vufvumy-shard-00-00.cws0ra7.mongodb.net:27017,ac-vufvumy-shard-00-01.cws0ra7.mongodb.net:27017,ac-vufvumy-shard-00-02.cws0ra7.mongodb.net:27017/?ssl=true&replicaSet=atlas-u9odt5-shard-0&authSource=admin&appName=stepwiseguide"

const client = new MongoClient(uri)

let db

async function connectDB() {
  await client.connect()
  db = client.db("stepwise")
  console.log("MongoDB connected")
}

// ===== Helper =====
function getUsersCollection() {
  return db.collection("users")
}

function getRecordsCollection() {
  return db.collection("records")
}

function getAssessmentsCollection() {
  return db.collection("assessments")
}

function requireLogin(req, res) {
  if (!req.session.userId) {
    res.status(401).json({
      message: "Not logged in"
    })
    return false
  }

  return true
}

// ===== Basic test route =====
app.get("/", (req, res) => {
  res.send("Stepwise backend is running")
})

// ===== DB test route =====
app.get("/api/test-db", async (req, res) => {
  try {
    const collections = await db.listCollections().toArray()
    res.json({
      message: "DB OK",
      collections
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Auth API =====

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body

    const users = getUsersCollection()

    const existing = await users.findOne({ username })

    if (existing) {
      return res.status(400).json({
        message: "Username already exists"
      })
    }

    await users.insertOne({
      username,
      password,
      createdAt: new Date()
    })

    res.json({ message: "Register success" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const users = getUsersCollection()

    const user = await users.findOne({ username, password })

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    req.session.userId = user._id
    req.session.username = user.username

    res.json({
      message: "Login success",
      user: {
        id: user._id,
        username: user.username
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Me
app.get("/api/auth/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Not logged in"
    })
  }

  res.json({
    id: req.session.userId,
    username: req.session.username
  })
})

// Logout
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy()
  res.json({ message: "Logged out" })
})

// ===== Records API =====

app.get("/api/records", async (req, res) => {
  try {
    if (!requireLogin(req, res)) return

    const records = getRecordsCollection()

    const data = await records
      .find({ userId: String(req.session.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    res.json(data)
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

app.post("/api/records", async (req, res) => {
  try {
    if (!requireLogin(req, res)) return

    const { date, weekday, steps, exercise, duration, calories } = req.body

    const records = getRecordsCollection()

    const record = {
      userId: String(req.session.userId),
      date,
      weekday,
      steps: Number(steps) || 0,
      exercise,
      duration: Number(duration) || 0,
      calories: Number(calories) || 0,
      createdAt: new Date()
    }

    const result = await records.insertOne(record)

    res.json({
      message: "Record saved",
      record: {
        id: String(result.insertedId),
        ...record
      }
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

// ===== Assessments API =====

app.get("/api/assessments/latest", async (req, res) => {
  try {
    if (!requireLogin(req, res)) return

    const assessments = getAssessmentsCollection()

    const latest = await assessments.findOne(
      { userId: String(req.session.userId) },
      { sort: { createdAt: -1 } }
    )

    if (!latest) {
      return res.json(null)
    }

    res.json(latest)
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

app.post("/api/assessments", async (req, res) => {
  try {
    if (!requireLogin(req, res)) return

    const { basicInfo, exerciseHabit, lifestyle, result } = req.body

    const assessments = getAssessmentsCollection()

    const assessment = {
      userId: String(req.session.userId),
      basicInfo,
      exerciseHabit,
      lifestyle,
      result,
      createdAt: new Date()
    }

    const insertResult = await assessments.insertOne(assessment)

    res.json({
      message: "Assessment saved",
      assessment: {
        id: String(insertResult.insertedId),
        ...assessment
      }
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

app.delete("/api/assessments/latest", async (req, res) => {
  try {
    if (!requireLogin(req, res)) return

    const assessments = getAssessmentsCollection()

    const latest = await assessments.findOne(
      { userId: String(req.session.userId) },
      { sort: { createdAt: -1 } }
    )

    if (!latest) {
      return res.json({
        message: "No assessment to discard"
      })
    }

    await assessments.deleteOne({ _id: latest._id })

    res.json({
      message: "Assessment discarded"
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

// ===== Start server =====
app.listen(PORT, async () => {
  await connectDB()
  console.log(`Server running at http://localhost:${PORT}`)
})
