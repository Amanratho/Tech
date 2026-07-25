const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/mobillor/Desktop/tech/Tech/Frontend/src';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace react-toastify stuff
    content = content.replace(/import\s+\{\s*toast\s*\}\s+from\s+['"]react-toastify['"];?/g, 'import { toast } from "../../utils/toastService";');
    content = content.replace(/import\s+['"]react-toastify\/dist\/ReactToastify\.css['"];?/g, '');
    content = content.replace(/import\s+\{\s*ToastContainer\s*\}\s+from\s+['"]react-toastify['"];?/g, '');
    content = content.replace(/<ToastContainer[^>]*\/>/g, '');

    if(content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
