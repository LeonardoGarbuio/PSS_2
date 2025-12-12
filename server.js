require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// OCR Endpoint
app.post('/api/ocr', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Imagem não fornecida' });
        }

        const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

        if (!apiKey || apiKey === 'SUA_API_KEY_AQUI') {
            return res.status(500).json({
                error: 'API Key não configurada. Edite o arquivo .env'
            });
        }

        // Remove data URL prefix if present
        const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

        // Call Google Cloud Vision API
        const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

        const requestBody = {
            requests: [{
                image: { content: base64Image },
                features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
            }]
        };

        const response = await fetch(visionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            console.error('Vision API Error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const textAnnotations = data.responses?.[0]?.textAnnotations;

        if (!textAnnotations || textAnnotations.length === 0) {
            return res.json({
                success: true,
                text: '',
                answers: [],
                message: 'Nenhum texto detectado na imagem'
            });
        }

        const fullText = textAnnotations[0].description;
        console.log('Texto detectado:', fullText);

        // Parse answers from detected text
        const answers = parseAnswers(fullText);

        res.json({
            success: true,
            text: fullText,
            answers: answers
        });

    } catch (error) {
        console.error('Erro no OCR:', error);
        res.status(500).json({ error: 'Erro ao processar imagem: ' + error.message });
    }
});

// Parse answers from OCR text
function parseAnswers(text) {
    const answers = [];
    const lines = text.split('\n');

    // Pattern 1: "1) 10" or "1. 10" or "1- 10" or "01) 10"
    const pattern1 = /^(\d{1,2})[).\-:\s]+(\d{1,2})$/;

    // Pattern 2: "1 - 10" or "1: 10"
    const pattern2 = /^(\d{1,2})\s*[-:]\s*(\d{1,2})$/;

    // Pattern 3: Just numbers in sequence (for answer grids)
    const pattern3 = /^\d{1,2}$/;

    // Pattern 4: "Q1: 10" or "Q01: 10"
    const pattern4 = /^[Qq]?(\d{1,2})[).\-:\s]+(\d{1,2})$/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Try pattern 1
        let match = trimmed.match(pattern1);
        if (match) {
            const qNum = parseInt(match[1]);
            const answer = parseInt(match[2]);
            if (qNum >= 1 && qNum <= 100 && answer >= 0 && answer <= 31) {
                answers[qNum - 1] = answer;
                continue;
            }
        }

        // Try pattern 2
        match = trimmed.match(pattern2);
        if (match) {
            const qNum = parseInt(match[1]);
            const answer = parseInt(match[2]);
            if (qNum >= 1 && qNum <= 100 && answer >= 0 && answer <= 31) {
                answers[qNum - 1] = answer;
                continue;
            }
        }

        // Try pattern 4
        match = trimmed.match(pattern4);
        if (match) {
            const qNum = parseInt(match[1]);
            const answer = parseInt(match[2]);
            if (qNum >= 1 && qNum <= 100 && answer >= 0 && answer <= 31) {
                answers[qNum - 1] = answer;
                continue;
            }
        }
    }

    // If no structured answers found, try to find numbers in sequence
    if (answers.filter(a => a !== undefined).length === 0) {
        const allNumbers = text.match(/\b\d{1,2}\b/g);
        if (allNumbers) {
            // Assume alternating: question number, answer, question number, answer...
            for (let i = 0; i < allNumbers.length - 1; i += 2) {
                const qNum = parseInt(allNumbers[i]);
                const answer = parseInt(allNumbers[i + 1]);
                if (qNum >= 1 && qNum <= 100 && answer >= 0 && answer <= 31) {
                    answers[qNum - 1] = answer;
                }
            }
        }
    }

    return answers;
}

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║     🎯 Corretor Somatória - Servidor Iniciado          ║
╠════════════════════════════════════════════════════════╣
║  📍 Acesse: http://localhost:${PORT}                       ║
║  📷 OCR disponível via Google Cloud Vision             ║
╚════════════════════════════════════════════════════════╝
    `);

    if (!process.env.GOOGLE_CLOUD_API_KEY ||
        process.env.GOOGLE_CLOUD_API_KEY === 'SUA_API_KEY_AQUI') {
        console.log('⚠️  ATENÇÃO: Configure sua API Key no arquivo .env');
    }
});
