const { MongoClient } = require('mongodb');
const mongo_client = new MongoClient("mongodb+srv://nenreh:mongoneh@schoolstuff.gjla1uc.mongodb.net/?retryWrites=true&w=majority&appName=SchoolStuff");

async function run(params) {
    try {
        await mongo_client.connect();
        const db = mongo_client.db("SocketIO");
        const user_collection = db.collection("Users");
        const r = await user_collection.updateMany({}, {$set: {profile_picture: "basic.webp"} })
        console.log(r);
    } catch {}
}
run()