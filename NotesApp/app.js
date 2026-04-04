const express = require("express");
const path = require("path");
const morgan  = require("morgan");
const { createClient } = require("@supabase/supabase-js");
require('dotenv').config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
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

// Helper functions for Supabase
const readBlogs = async () => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error reading blogs:', error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
};

const writeBlog = async (blog) => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .insert([blog])
            .select();
        
        if (error) {
            console.error('Error writing blog:', error);
            return null;
        }
        return data?.[0];
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
};

const updateBlog = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .update(updates)
            .eq('id', id)
            .select();
        
        if (error) {
            console.error('Error updating blog:', error);
            return null;
        }
        return data?.[0];
    } catch (err) {
        console.error('Error:', err);
        return null;
    }
};

const deleteBlog = async (id) => {
    try {
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error('Error deleting blog:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Error:', err);
        return false;
    }
};

const generateId = () => {
    return Date.now().toString();
};

// GET / - Home page with all blogs
app.get("/", async (req,res) => {
    const blogs = await readBlogs();
    res.render("index", {title:"Home", blogs: blogs});
});

// GET /create - Show create blog form
app.get("/create", (req,res) => {
    res.render("create", {title: "Create Blog"});
});

// POST /blogs - Create new blog
app.post("/blogs", async (req,res) => {
    const {title, snippet, body} = req.body;
    
    if (!title || !snippet || !body) {
        return res.status(400).render("create", {title: "Create Blog", error: "All fields are required"});
    }
    
    const newBlog = {
        id: generateId(),
        title,
        snippet,
        body,
        created_at: new Date().toISOString()
    };
    
    const result = await writeBlog(newBlog);
    if (!result) {
        return res.status(500).render("create", {title: "Create Blog", error: "Failed to create blog"});
    }
    
    res.redirect("/");
});

// GET /blogs/:id - View single blog
app.get("/blogs/:id", async (req,res) => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (error || !data) {
            return res.status(404).render("404", {title: "404"});
        }
        
        res.render("blog", {title: data.title, blog: data});
    } catch (err) {
        res.status(404).render("404", {title: "404"});
    }
});

// GET /blogs/:id/edit - Show edit form
app.get("/blogs/:id/edit", async (req,res) => {
    try {
        const { data, error } = await supabase
            .from('blogs')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (error || !data) {
            return res.status(404).render("404", {title: "404"});
        }
        
        res.render("edit", {title: "Edit Blog", blog: data});
    } catch (err) {
        res.status(404).render("404", {title: "404"});
    }
});

// POST /blogs/:id - Update blog
app.post("/blogs/:id", async (req,res) => {
    const {title, snippet, body} = req.body;
    
    const updates = {
        title,
        snippet,
        body,
        updated_at: new Date().toISOString()
    };
    
    const result = await updateBlog(req.params.id, updates);
    
    if (!result) {
        return res.status(404).render("404", {title: "404"});
    }
    
    res.redirect(`/blogs/${req.params.id}`);
});

// DELETE /blogs/:id - Delete blog
app.delete("/blogs/:id", async (req,res) => {
    const success = await deleteBlog(req.params.id);
    
    if (!success) {
        return res.status(404).json({error: "Blog not found"});
    }
    
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

app.listen(process.env.PORT || 3000,() => {
    console.log("Server running at http://localhost:3000/");
});