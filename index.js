const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2wx0q80.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const userCollection = client.db('netBook').collection('users')
    const noteCollection = client.db('netBook').collection('notes')
    // add user database 
    app.post('/users', async (req, res) => {
        const newUser = req.body;
        const query = { email: newUser.email }
        const user = await userCollection.findOne(query);
        if (!user) {
            const result = await userCollection.insertOne(newUser)
            return res.send(result)
        }
        res.send({ message: 'already store data' })
    })
    app.post('/notes', async (req, res) => {
        const note = req.body;
        const result = await noteCollection.insertOne(note)
        res.send(result)
    })
}


run().catch(e => console.error(e))

app.get('/', (req, res) => {
    res.send('Net book server is running')
})

app.listen(port, () => {
    console.log(`Net book server running ${port}`)
})