require('dotenv').config()

const connectDB = require('./db/connect')
const Product = require('./models/product')

const jsonProducts = require('./products.json')

const start = async ()=> {
    try {
        await connectDB(process.env.MONGO_URI)
        await Product.deleteMany()
        await Product.create(jsonProducts)
        console.log('Succesfully')
        process.exit(0) //corta la ejecucion
    }catch (error) {
       console.log(error)
    }
}
start()