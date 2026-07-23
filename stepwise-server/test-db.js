const { MongoClient } = require("mongodb")

const uri = "mongodb://admin:1145141919810@ac-vufvumy-shard-00-00.cws0ra7.mongodb.net:27017,ac-vufvumy-shard-00-01.cws0ra7.mongodb.net:27017,ac-vufvumy-shard-00-02.cws0ra7.mongodb.net:27017/?ssl=true&replicaSet=atlas-u9odt5-shard-0&authSource=admin&appName=stepwiseguide"

const client = new MongoClient(uri)

async function run() {
  try {
    await client.connect()
    console.log("MongoDB 连接成功！")
  } catch (err) {
    console.error("连接失败：", err)
  } finally {
    await client.close()
  }
}

run()