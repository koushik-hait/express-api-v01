const express = require('express');
const apis = require('./routes/api')

// ...

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://testuser:<password>@cluster0.6viev.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


const app = express();
app.use('/api/v1', apis)
app.get('/', (req,res)=>{
    res.status(200).send('hello my get client......')
});

app.post('/', (req,res)=>{
    res.status(200).send('hello my post client......')
});

const port = 3000;
app.listen(port,() => {
    console.log(`App is running in  ${port}.....`)
});