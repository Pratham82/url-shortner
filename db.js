const mongoose = require('mongoose')

const connectToDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      },
      () => console.log('Connected to Remote DB 🟢')
    )
  } catch (e) {
    /* handle error */
    console.error(e.message)
    process.exit(1)
  }
}

module.exports = connectToDB
