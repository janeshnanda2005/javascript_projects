const express = require("express");

const app = express();

const PORT = 3000;

const data = ["jim halpert",'Micheal Scott','Dwight Schrute','Pam Beesly','Ryan Howard','Stanley Hudson','Kevin Malone','Angela Martin','Oscar Martinez','Creed Bratton','Toby Flenderson','Kelly Kapoor','Meredith Palmer','Phyllis Vance']; 


app.use(express.json());    

app.get("/",(request,response) =>{
    response.status(200).send("<h1>Hello World</h1>"); 
})

app.get("/dashboard",(request,response) =>{
    response.status(200).send("<h1>Welcome to the dashboard</h1>");
});

app.get('/api/data',(request,response) =>{
    console.log("the data is being requested");
    response.status(599).send(data);

})

app.post("/api/data",(request,response) =>{
        const entry = request.body;
        data.push(entry);
        response.sendStatus(201);
});


app.delete('/api/data', (req, res) => {
    data.pop()
    console.log('We deleted the element off the end of the array')
    res.sendStatus(203)
})

app.listen(PORT,()=> console.log("Server running at http://localhost:3000/"));