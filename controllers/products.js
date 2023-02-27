const Product = require('../models/product')
//testing
const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({
    })
    res.status(200).json({ products, results: products.length })

}
const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilters } = req.query
    const queryObject = {}
    //filtrado
    if (featured) {
        queryObject.featured = featured === 'true' ? true : false
    }
    if (company) {
        queryObject.company = company
    }
    if (name) {
        queryObject.name = { $regex: name, $options: 'i' }
        //regex: selecciona docs que conincidan con una expresion regular
        //options: opciones para el match
    }

    if (numericFilters) {
        //reemplaza los simbolos por la sintaxis de moogose
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte'
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g

        let filters = numericFilters.replace(regEx, (match) =>
            `-${operatorMap[match]}-`
        )
        //filtro dinamico en el query
        const options = ['price', 'rating']
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-')
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) }
            }
        })
    }

    console.log(queryObject);
    let result = Product.find(queryObject)
    if (sort) {
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
        //products = products.sort()
    } else {
        result = result.sort('createdAt')
    }
    //selecciona campos
    if (fields) {
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }
    //paginado

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    //pagina -1 = 0, 0*limit = 0. Nos salteamos 0 items 
    //pagina 2: 2-1=1, 1*5(se muesran 5 items por pagina)=5. Saltea los primeros 5 y muestra los siguintes 5 items
    const skip = (page - 1) * limit
    result = result.skip(skip).limit(limit)

    const products = await result //resultado completo con o sin filtrado
    res.status(200).json({ products, results: products.length })
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}