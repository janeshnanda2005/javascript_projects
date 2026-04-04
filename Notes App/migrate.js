const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Supabase configuration
const SUPABASE_URL = "https://aisnltwokrulexslahxn.supabase.co";
const SUPABASE_KEY = "sb_publishable_IK--yOW2_DLn6dmUR4Wawg_DhlMh6OO";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dataFile = path.join(__dirname, 'blogs.json');

async function migrate() {
    try {
        // Read JSON file
        const data = fs.readFileSync(dataFile, 'utf8');
        const blogs = JSON.parse(data);
        
        console.log(`Found ${blogs.length} blog(s) to migrate...`);
        
        // Transform and insert each blog
        for (const blog of blogs) {
            const transformedBlog = {
                id: blog.id,
                title: blog.title,
                snippet: blog.snippet,
                body: blog.body,
                created_at: blog.createdAt,
                updated_at: blog.updatedAt || null
            };
            
            const { data: result, error } = await supabase
                .from('blogs')
                .insert([transformedBlog])
                .select();
            
            if (error) {
                console.error(`Error inserting blog "${blog.title}":`, error.message);
            } else {
                console.log(`✓ Migrated blog: "${blog.title}"`);
            }
        }
        
        console.log("Migration complete!");
        
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
