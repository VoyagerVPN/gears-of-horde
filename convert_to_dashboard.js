const fs = require('fs');

const content = fs.readFileSync('supabase_import.sql', 'utf8');
const lines = content.split('\n');

let output = [];
let inCopy = false;
let copyTable = "";
let copyColumns = "";

// Initial setup
output.push("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
output.push("SET search_path = public, extensions;");

for (let line of lines) {
    // Detect COPY command
    const copyMatch = line.match(/COPY public\."?(\w+)"? \((.+)\) FROM stdin;/);
    if (copyMatch) {
        inCopy = true;
        copyTable = copyMatch[1];
        copyColumns = copyMatch[2];
        continue;
    }

    if (inCopy) {
        // End of COPY data
        if (line.trim() === '\\.') {
            inCopy = false;
            continue;
        }
        
        // Convert tab-separated values to SQL INSERT values
        const values = line.split('\t').map(v => {
            if (v === '\\N') return 'NULL';
            // Escape single quotes and wrap in quotes
            return "'" + v.replace(/'/g, "''") + "'";
        }).join(', ');
        
        output.push(`INSERT INTO public."${copyTable}" (${copyColumns}) VALUES (${values});`);
        continue;
    }

    // Skip Neon-specific or meta commands from the original dump that might cause issues
    if (line.startsWith('\\') || line.startsWith('--') || line.trim() === "") continue;
    
    // Include everything else (CREATE TABLE, ALTER, etc.)
    output.push(line);
}

fs.writeFileSync('supabase_dashboard_import.sql', output.join('\n'));
console.log('Done! Generated supabase_dashboard_import.sql');
