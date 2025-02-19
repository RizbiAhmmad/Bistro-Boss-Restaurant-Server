const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000

// Middleware to parse JSON request bodies
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwqfj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();


    const userCollection = client.db("BistroDB").collection("users");
    const menuCollection = client.db("BistroDB").collection("menu");
    const reviewCollection = client.db("BistroDB").collection("reviews");
    const cartCollection = client.db("BistroDB").collection("carts");

    // user related api
    app.post ('/users', async (req, res) => {
      const user = req.body;
      // insert email if user doesnot exist
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query);
      if (existingUser){
        return res.send({message:'User already exists', insertedId:null});
      }
      const result = await userCollection.insertOne(user);
      res.status(201).send(result);
    })


    app.get ('/menu', async (req, res) =>{
        const result = await menuCollection.find().toArray();
        res.send(result);
    })

    app.get ('/reviews', async (req, res) =>{
        const result = await reviewCollection.find().toArray();
        res.send(result);
    })



    // carts collection
    app.get('/carts',async (req, res) =>{
      const email=req.query.email;
      const query = {email:email}
      const result = await cartCollection.find(query).toArray();
        res.send(result);
    });


    app.post('/carts', async (req, res) => {
        const cartitem = req.body;
        const result= await cartCollection.insertOne(cartitem);
        res.status(201).send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query ={_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query);
      res.send(result);
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



app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
