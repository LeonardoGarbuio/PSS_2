export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Imagem não fornecida' });
        }

        const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'API Key não configurada. Configure GOOGLE_CLOUD_API_KEY nas variáveis de ambiente da Vercel.'
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
}

// Parse answers from OCR text
function parseAnswers(text) {
    const answers = [];
    const lines = text.split('\n');

    const pattern1 = /^(\d{1,2})[).\-:\s]+(\d{1,2})$/;
    const pattern2 = /^(\d{1,2})\s*[-:]\s*(\d{1,2})$/;
    const pattern4 = /^[Qq]?(\d{1,2})[).\-:\s]+(\d{1,2})$/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let match = trimmed.match(pattern1);
        if (match) {
            const qNum = parseInt(match[1]);
            const answer = parseInt(match[2]);
            if (qNum >= 1 && qNum <= 100 && answer >= 0 && answer <= 31) {
                answers[qNum - 1] = answer;
                continue;
            }
        }

        match = trimmed.match(pattern2);
        if (match) {
            const qNum = parseInt(match[1]);
            const answer = parseInt(match[2]);
            if (qNum >= 1 && qNum <= 100 && answer >= 0 && answer <= 31) {
                answers[qNum - 1] = answer;
                continue;
            }
        }

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

    if (answers.filter(a => a !== undefined).length === 0) {
        const allNumbers = text.match(/\b\d{1,2}\b/g);
        if (allNumbers) {
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
