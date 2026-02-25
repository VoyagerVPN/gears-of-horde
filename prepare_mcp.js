const fs = require('fs');

const content = fs.readFileSync('supabase_import.sql', 'utf8');
const lines = content.split('\n');

let commands = [];
let currentCommand = "";
let inCopy = false;
let copyHeader = "";
let copyTable = "";
let copyColumns = "";

for (let line of lines) {
    if (line.startsWith('COPY ')) {
        // Run what we have so far
        if (currentCommand.trim()) {
            commands.push(currentCommand);
            currentCommand = "";
        }
        
        inCopy = true;
        copyHeader = line.replace(' FROM stdin;', '');
        const match = line.match(/COPY public\."?(\w+)"? \((.+)\) FROM stdin;/);
        if (match) {
            copyTable = match[1];
            copyColumns = match[2];
        }
        continue;
    }

    if (inCopy) {
        if (line.trim() === '\\.') {
            inCopy = false;
            copyTable = "";
            copyColumns = "";
            continue;
        }
        
        const values = line.split('\t').map(v => {
            if (v === '\\N') return 'NULL';
            // Escape single quotes for SQL
            return "'" + v.replace(/'/g, "''") + "'";
        }).join(', ');
        
        commands.push(`INSERT INTO public."${copyTable}" (${copyColumns}) VALUES (${values});`);
        continue;
    }

    if (line.startsWith('--') || line.trim() === "") continue;

    currentCommand += line + "\n";
    
    // Simple semicolon check (not perfect but works for standard dumps)
    if (line.trim().endsWith(';')) {
        commands.push(currentCommand);
        currentCommand = "";
    }
}

if (currentCommand.trim()) commands.push(currentCommand);

fs.writeFileSync('mcp_commands.json', JSON.stringify(commands, null, 2));
console.log(`Converted to ${commands.length} commands.`);
