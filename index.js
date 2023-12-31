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




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        // else if(req.query?.search){
        //   query = {productName : req.query.search}
        // }
        
        let sortObj = {}
        const value = req.query.value
        const type = req.query.type
        sortObj[value] = type
        console.log(req.query)
        const result = await addedToysCollection.find(query).sort(sortObj).toArray()
        res.send(result.slice(0,20))
    })

    app.get('/addToysCollection',async(req,res)=>{
      const search = req.query.search
        const keys = ["productName"]
        const finding = (data) => {
          return data.filter(item => 
            keys.some(key =>  item[key].toLowerCase().includes(search))
            )
        }
      const result = await addedToysCollection.find().toArray()
      res.send(finding(result))
    })


    app.delete('/addToys/:id', async(req,res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result =await addedToysCollection.deleteOne(query)
        res.send(result)
    })

    app.get('/addToys/:id',async(req,res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await addedToysCollection.findOne(query)
      res.send(result)
    })

    app.put('/addToys/:id',async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const options = {upsert:true}
      const updatedProduct = req.body
      const product = {
        $set: {
            productName : updatedProduct.productName,
            email:updatedProduct.email,
            img:updatedProduct.img,
            name:updatedProduct.name,
            category:updatedProduct.category,
            description:updatedProduct.description,
            quantity:updatedProduct.quantity,
            price:updatedProduct.price,
            rating:updatedProduct.rating
        }
      }
      const result = await addedToysCollection.updateOne(filter,product,options)
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