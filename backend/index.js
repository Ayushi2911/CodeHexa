require("dotenv").config();

const { MongoClient } = require("mongodb");

const url = process.env.MONGODB_URI || process.env.MONGO_URI;

async function main() {
    if (!url) {
        throw new Error("MONGODB_URI or MONGO_URI is not set in .env");
    }

    const client = new MongoClient(url, {
        serverSelectionTimeoutMS: 10000,
    });

    try {
        await client.connect();
        await client.db().command({ ping: 1 });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exitCode = 1;
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error("MongoDB configuration error:", error.message);
    process.exitCode = 1;
});
