const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000


require('dotenv').config()



app.use(cors())
app.use(express.json())


app.get('/',(req,res) => {
    res.send("Toy Enthuasist Server Is Running")
})




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.choi6e7.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('toysCollection').collection('toys')
    const addedToysCollection = client.db('toysCollection').collection('addedToys')

    app.get('/collection', async(req,res) => {
        let query= {}
        if(req.query?.category){
            query = {category : req.query.category}
        }
        const cursor = toysCollection.find(query)
        const result =await cursor.toArray()
        res.send(result)
    })

    app.post('/addToys',async(req,res) => {
        const addedToys = req.body
        console.log(addedToys);
        const result = await addedToysCollection.insertOne(addedToys)
        res.send(result)

    })

    app.get('/addToys',async(req,res) => {
        let query= {}
        if(req.query?.email){
            query = {email : req.query.email}
        }
        const result = await addedToysCollection.find(query).toArray()
        res.send(result)
    })

    




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port,() => {
    console.log(`Server is running on port ${port}`)
})