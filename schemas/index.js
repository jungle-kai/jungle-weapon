const mongoose = require("mongoose");

const connect = () => {
    const options = {
        writeConcern: {
            w: 1,
            j: true
        }
    }; // Ensure that all writes are written (data durability)

    mongoose
        .connect("mongodb://localhost:27017/db_express_task", options)
        .catch(err => console.log(err));
};

mongoose.connection.on("error", err => {
    console.error("MongoDB connection error", err);
});

module.exports = connect;
