const express = require("express");
const morgan  = require("morgan");
const fs = require("fs");
const path = require("path");

const app = express();

app.set("view engine", "ejs");

// Middleware
app.use(express.static('public'));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req,res,next) => {
    console.log("New request made:");
    console.log("Host: ", req.hostname);
    console.log("Path: ", req.path);
    console.log("Method: ", req.method);
    next();
});

// Data storage file
const dataFile = path.join(__dirname, 'blogs.json');

// Helper functions
const readBlogs = () => {
    try {
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (err) {
        return [];
    }
};

const writeBlogs = (blogs) => {
    fs.writeFileSync(dataFile, JSON.stringify(blogs, null, 2));
};

const generateId = () => {
    return Date.now().toString();
};

// GET / - Home page with all blogs
app.get("/", (req,res) => {
    const blogs = readBlogs();
    res.render("index", {title:"Home", blogs: blogs});
});

// GET /create - Show create blog form
app.get("/create", (req,res) => {
    res.render("create", {title: "Create Blog"});
});

// POST /blogs - Create new blog
app.post("/blogs", (req,res) => {
    const {title, snippet, body} = req.body;
    
    if (!title || !snippet || !body) {
        return res.status(400).render("create", {title: "Create Blog", error: "All fields are required"});
    }
    
    const blogs = readBlogs();
    const newBlog = {
        id: generateId(),
        title,
        snippet,
        body,
        createdAt: new Date().toISOString()
    };
    
    blogs.unshift(newBlog);
    writeBlogs(blogs);
    res.redirect("/");
});

// GET /blogs/:id - View single blog
app.get("/blogs/:id", (req,res) => {
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id === req.params.id);
    
    if (!blog) {
        return res.status(404).render("404", {title: "404"});
    }
    
    res.render("blog", {title: blog.title, blog: blog});
});

// GET /blogs/:id/edit - Show edit form
app.get("/blogs/:id/edit", (req,res) => {
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id === req.params.id);
    
    if (!blog) {
        return res.status(404).render("404", {title: "404"});
    }
    
    res.render("edit", {title: "Edit Blog", blog: blog});
});

// PUT /blogs/:id - Update blog
app.post("/blogs/:id", (req,res) => {
    const {title, snippet, body} = req.body;
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id === req.params.id);
    
    if (!blog) {
        return res.status(404).render("404", {title: "404"});
    }
    
    blog.title = title;
    blog.snippet = snippet;
    blog.body = body;
    blog.updatedAt = new Date().toISOString();      
    
    writeBlogs(blogs);
    res.redirect(`/blogs/${blog.id}`);
});

// DELETE /blogs/:id - Delete blog
app.delete("/blogs/:id", (req,res) => {
    const blogs = readBlogs();
    const index = blogs.findIndex(b => b.id === req.params.id);
    
    if (index === -1) {
        return res.status(404).json({error: "Blog not found"});
    }
    
    blogs.splice(index, 1);
    writeBlogs(blogs);
    res.json({message: "Blog deleted"});
});

app.get("/about", (req,res)=> {
    res.render("about",{title:"About"});
})

app.get("/about-us/", (req,res) =>{
    res.redirect("/about");
})

app.use((req,res) =>{
    res.status(404).render("404",{"title":"404"});
});

app.listen(3000,() => {
    console.log("Server running at http://localhost:3000/");
});