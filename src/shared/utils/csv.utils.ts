const csv = require('csv-parser')
const fs = require('fs')


export async function parsedCSV(filepath: any, option?: {}): Promise<any[]> {
    let results: any[] = [];
    return new Promise<any[]>((resolve, reject) => {
        fs.createReadStream(filepath)
            .pipe(csv(option))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results)
            });
    });
}


export async function modifyHeaders(filepath: any): Promise<any> {
    const option = {
        mapHeaders: ({ header, index }) => header.toUpperCase()
    }
    const data = parsedCSV(filepath, option);
    return data;

}

export async function fileIsValid(filepath: string): Promise<Boolean> {
    let isValid: boolean = true;
    const data = await structureData(filepath);
    data.forEach(datum => {
        const headers = Object.keys(datum);
        for (const header of headers) {
            if (datum[header] === '' || header === '') {
                isValid = false;
                break;
            }
        }
    })
    return isValid;
}

export async function structureData(filepath: string): Promise<any>{
    const option = { separator: ';' }
    const data = await parsedCSV(filepath, option);
    return data;
}

export async function readCSV(filepath: string): Promise<any> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(
            filepath,
            (error: NodeJS.ErrnoException | null, data: Buffer) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data.toString());
                }
            },
        );
    });
}