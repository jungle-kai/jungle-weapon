const swaggereJsdoc = require("swagger-jsdoc")

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "SWJ W12, Express.js Task",
            description:
                "Express.js + mySQL + Swagger",
        },
        servers: [
            {
                url: "http://upside.run", // 요청 URL
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: { // This name here is what you'll refer to in your security sections
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ["./routes/*.js"], //Swagger 파일 연동
}
const specs = swaggereJsdoc(options)

module.exports = specs;