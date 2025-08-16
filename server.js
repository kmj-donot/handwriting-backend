const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const port = 5000; // Choose a port that is not in use by your React app

app.use(cors()); // Allow cross-origin requests from your React app
app.use(express.json());

// Set up Multer for file uploads
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send('Handwriting Converter Backend is running.');
});

// Define the file upload endpoint
app.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const fileBuffer = req.file.buffer;
        let extractedText = '';

        // Check the file's MIME type to determine how to parse it
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            extractedText = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
        } else {
            return res.status(400).json({ error: 'Unsupported file type.' });
        }

        // Send the extracted text back to the frontend
        res.json({ text: extractedText });

    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process document.' });
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});