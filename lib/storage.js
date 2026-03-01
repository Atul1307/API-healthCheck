import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'services.json');

export function readServices() {
    try{
        const raw = fs.readFileSync(DATA_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch{
        return []
    }
}

export function writeServices(services){
    fs.mkdirSync(path.dirname(DATA_PATH), {recursive: true});
    fs.writeFileSync(DATA_PATH, JSON.stringify(services,null,2))
}