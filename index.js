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
    const commentCollection = client.db('netBook').collection('comment')

    //send notes client
    app.get('/notes/:email', async (req, res) => {
        const email = req.params.email
        const query = { email }
        const allNote = await noteCollection.find(query, { sort: { _id: -1 } }).toArray()
        const notes = allNote.filter(n => !n.completed)
        res.send(notes);
    })
    //send note client
    app.get('/note/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const note = await noteCollection.findOne(query)
        res.send(note);
    })

    //send completed notes client
    app.get('/completed-notes/:email', async (req, res) => {
        const email = req.params.email
        const query = { email }
        const allNote = await noteCollection.find(query, { sort: { _id: -1 } }).toArray()
        const notes = allNote.filter(n => n.completed)
        res.send(notes);
    })
    //send comments client
    app.get('/comments/:id', async (req, res) => {
        const id = req.params.id
        const query = { commentID: id }
        const comments = await commentCollection.find(query, { sort: { _id: -1 } }).toArray()
        res.send(comments);
    })
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
    // add note
    app.post('/notes', async (req, res) => {
        const note = req.body;
        const result = await noteCollection.insertOne(note)
        res.send(result)
    })
    // add comment
    app.post('/comments', async (req, res) => {
        const note = req.body;
        const result = await commentCollection.insertOne(note)
        res.send(result)
    })
    //update note
    app.put('/note/:id', async (req, res) => {
        const id = req.params.id
        const note = req.body;
        const filter = { _id: ObjectId(id) };
        const updatedDoc = {
            $set: note
        }
        const result = await noteCollection.updateOne(filter, updatedDoc);
        res.send(result);
    })
    // update completed situation
    app.put('/notes/:id', async (req, res) => {
        const id = req.params.id;
        const complete = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
            $set: complete
        }
        const result = await noteCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    })
    // delete note
    app.delete('/notes/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await noteCollection.deleteOne(query);
        res.send(result);
    })
}


run().catch(e => console.error(e))

app.get('/', (req, res) => {
    res.send('Net book server is running')
})

app.listen(port, () => {
    console.log(`Net book server running ${port}`)
})