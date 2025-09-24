import express from 'express';
import multer from 'multer';
import fs from 'fs-extra';
import path from 'path';
import cors from 'cors';

const app = express();
const UPLOAD_DIR = path.resolve('./uploads');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(req)

        const hash = req.headers['file-hash'];
        if (!hash) return cb(new Error('fileHash is required'));

        const chunkDir = path.join(UPLOAD_DIR, hash);
        fs.ensureDirSync(chunkDir);
        cb(null, chunkDir);
    },
    filename: (req, file, cb) => {
        const index = req.headers['chunk-index'];
        if (index === undefined) return cb(new Error('chunkIndex is required'));
        cb(null, index);
    }
});


const upload = multer({ storage }).any(); // 支持多字段

// 接收分片
app.post('/upload', upload, (req, res) => {
    console.log(`Received chunk: ${req.body.chunkIndex} of fileHash: ${req.body.fileHash}`);
    res.json({ status: 'ok' });
});

// 合并分片
app.post('/merge', async (req, res) => {
    const { fileHash, fileName, totalChunks } = req.body;

    const chunkDir = path.join(UPLOAD_DIR, fileHash);
    const filePath = path.join(UPLOAD_DIR, fileName);

    if (!fs.existsSync(chunkDir)) return res.status(400).json({ message: 'Chunks not found' });

    const writeStream = fs.createWriteStream(filePath);
    const chunks = fs.readdirSync(chunkDir)
        .sort((a, b) => Number(a) - Number(b)); // 按索引排序

    for (const chunkName of chunks) {
        const chunkPath = path.join(chunkDir, chunkName);
        if (!fs.existsSync(chunkPath)) continue; // 容错
        const data = fs.readFileSync(chunkPath);
        writeStream.write(data);
    }
    writeStream.end();

    // 可选：删除分片目录
    fs.removeSync(chunkDir);

    res.json({ status: 'merged', path: filePath });
});

app.listen(3300, () => console.log('Server running at http://localhost:3300'));
