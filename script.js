document.addEventListener('DOMContentLoaded', () => {
    // State
    let numQuestions = 60;
    let answerKey = [];
    let studentAnswers = [];
    let examImages = [];
    let currentImageIndex = 0;

    // DOM Elements
    const steps = {
        setup: document.getElementById('step-setup'),
        key: document.getElementById('step-key'),
        grading: document.getElementById('step-grading'),
        results: document.getElementById('step-results')
    };

    const inputs = {
        numQuestions: document.getElementById('num-questions'),
        languageSelect: document.getElementById('language-select'),
        keyContainer: document.getElementById('key-inputs-container'),
        gradingContainer: document.getElementById('grading-inputs-container'),
        examPhoto: document.getElementById('exam-photo'),
        dropZone: document.getElementById('drop-zone'),
        examPreview: document.getElementById('exam-preview'),
        imageControls: document.getElementById('image-controls'),
        btnPrevImg: document.getElementById('btn-prev-img'),
        btnNextImg: document.getElementById('btn-next-img'),
        imgIndicator: document.getElementById('img-indicator')
    };

    const buttons = {
        toKey: document.getElementById('btn-to-key'),
        backSetup: document.getElementById('btn-back-setup'),
        toGrading: document.getElementById('btn-to-grading'),
        backKey: document.getElementById('btn-back-key'),
        finish: document.getElementById('btn-finish'),
        restart: document.getElementById('btn-restart'),
        scanAI: document.getElementById('btn-scan-ai')
    };

    const results = {
        breakdown: document.getElementById('results-breakdown'),
        finalScore: document.getElementById('final-score'),
        maxScore: document.getElementById('max-score')
    };

    // Pre-defined Answer Key Data (PSS 2 2025)
    const PRESET_KEY = {
        ingles: [
            6, 10, 3, 13, 11, 15, 12, 14, 5, 15,   // 1-10
            9, 3, 7, 12, 14, 6, 11, 14, 10, 15,    // 11-20
            3, 9, 5, 13, 12, 13, 15, 5, 7, 6,      // 21-30
            14, 10, 12, 7, 3, 9, 15, 11, 5, 13,    // 31-40
            6, 14, 10, 7, 12, 11, 15, 3, 14, 5,    // 41-50
            13, 9, 15, 14, 6, 10, 3, 11, 7, 5      // 51-60
        ],
        espanhol: [
            6, 10, 3, 13, 11, 9, 7, 3, 12, 11,     // 1-10 (diferentes 6-10)
            9, 3, 7, 12, 14, 6, 11, 14, 10, 15,    // 11-20
            3, 9, 5, 13, 12, 13, 15, 5, 7, 6,      // 21-30
            14, 10, 12, 7, 3, 9, 15, 11, 5, 13,    // 31-40
            6, 14, 10, 7, 12, 11, 15, 3, 14, 5,    // 41-50
            13, 9, 15, 14, 6, 10, 3, 11, 7, 5      // 51-60
        ]
    };

    // PSS 2 Subject Mapping (60 Questions, 5 per subject)
    const SUBJECTS = [
        { name: 'Língua Portuguesa', start: 1, end: 5 },
        { name: 'Língua Estrangeira', start: 6, end: 10 },
        { name: 'Artes', start: 11, end: 15 },
        { name: 'Ed. Física', start: 16, end: 20 },
        { name: 'Matemática', start: 21, end: 25 },
        { name: 'Física', start: 26, end: 30 },
        { name: 'Química', start: 31, end: 35 },
        { name: 'Biologia', start: 36, end: 40 },
        { name: 'História', start: 41, end: 45 },
        { name: 'Geografia', start: 46, end: 50 },
        { name: 'Filosofia', start: 51, end: 55 },
        { name: 'Sociologia', start: 56, end: 60 }
    ];

    // Helper Functions
    function showStep(stepName) {
        Object.values(steps).forEach(s => s.classList.add('hidden'));
        steps[stepName].classList.remove('hidden');
    }

    function generateKeyInputs(language) {
        inputs.keyContainer.innerHTML = '';
        const preset = PRESET_KEY[language] || PRESET_KEY.ingles;
        answerKey = [...preset];

        for (let i = 0; i < numQuestions; i++) {
            const div = document.createElement('div');
            div.className = 'question-input';
            div.innerHTML = `
                <label>Q${i + 1}</label>
                <input type="number" min="0" max="31" value="${preset[i] || 0}" data-index="${i}">
            `;
            inputs.keyContainer.appendChild(div);
        }

        // Update answerKey on input change
        inputs.keyContainer.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                answerKey[idx] = parseInt(e.target.value) || 0;
            });
        });
    }

    function generateGradingInputs() {
        inputs.gradingContainer.innerHTML = '';
        studentAnswers = new Array(numQuestions).fill(0);

        for (let i = 0; i < numQuestions; i++) {
            const div = document.createElement('div');
            div.className = 'question-input';
            div.innerHTML = `
                <label>Q${i + 1}</label>
                <input type="number" min="0" max="31" value="0" data-index="${i}" id="student-q${i}">
            `;
            inputs.gradingContainer.appendChild(div);
        }

        inputs.gradingContainer.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const idx = parseInt(e.target.dataset.index);
                studentAnswers[idx] = parseInt(e.target.value) || 0;
            });
        });
    }

    // Step Navigation
    buttons.toKey.addEventListener('click', () => {
        const val = parseInt(inputs.numQuestions.value);
        if (val > 0 && val <= 100) {
            numQuestions = val;
            const lang = inputs.languageSelect.value;
            generateKeyInputs(lang);
            showStep('key');
        } else {
            alert('Por favor, insira um número válido de questões (1-100).');
        }
    });

    buttons.backSetup.addEventListener('click', () => showStep('setup'));

    buttons.toGrading.addEventListener('click', () => {
        // Collect answer key values
        inputs.keyContainer.querySelectorAll('input').forEach(inp => {
            const idx = parseInt(inp.dataset.index);
            answerKey[idx] = parseInt(inp.value) || 0;
        });
        generateGradingInputs();
        showStep('grading');
    });

    buttons.backKey.addEventListener('click', () => showStep('key'));

    // Image Handling Logic (Multi-photo)
    function updateImageDisplay() {
        if (examImages.length > 0) {
            inputs.examPreview.src = examImages[currentImageIndex];
            inputs.examPreview.classList.remove('hidden');
            inputs.dropZone.querySelector('.upload-placeholder').classList.add('hidden');

            if (examImages.length > 1) {
                inputs.imageControls.classList.remove('hidden');
                inputs.imgIndicator.textContent = `${currentImageIndex + 1} / ${examImages.length}`;
            } else {
                inputs.imageControls.classList.add('hidden');
            }
        } else {
            inputs.examPreview.classList.add('hidden');
            inputs.dropZone.querySelector('.upload-placeholder').classList.remove('hidden');
            inputs.imageControls.classList.add('hidden');
        }
    }

    inputs.btnPrevImg.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateImageDisplay();
        }
    });

    inputs.btnNextImg.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentImageIndex < examImages.length - 1) {
            currentImageIndex++;
            updateImageDisplay();
        }
    });

    inputs.dropZone.addEventListener('click', () => inputs.examPhoto.click());

    inputs.examPhoto.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    inputs.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        inputs.dropZone.style.borderColor = 'var(--primary-color)';
    });

    inputs.dropZone.addEventListener('dragleave', () => {
        inputs.dropZone.style.borderColor = 'var(--glass-border)';
    });

    inputs.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        inputs.dropZone.style.borderColor = 'var(--glass-border)';
        handleFiles(e.dataTransfer.files);
    });

    function handleFiles(files) {
        if (files && files.length > 0) {
            examImages = [];
            currentImageIndex = 0;
            let loadedCount = 0;

            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        examImages.push(e.target.result);
                        loadedCount++;
                        if (loadedCount === files.length || loadedCount === examImages.length) {
                            updateImageDisplay();
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // ==================== OCR WITH AI ====================
    buttons.scanAI.addEventListener('click', async () => {
        if (examImages.length === 0) {
            alert('Por favor, carregue uma foto da prova primeiro!');
            return;
        }

        buttons.scanAI.disabled = true;
        buttons.scanAI.textContent = '🔄 Processando...';

        try {
            // Process all images
            let allAnswers = [];

            for (let i = 0; i < examImages.length; i++) {
                buttons.scanAI.textContent = `🔄 Processando imagem ${i + 1}/${examImages.length}...`;

                const response = await fetch('/api/ocr', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: examImages[i] })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro no servidor');
                }

                if (data.answers && data.answers.length > 0) {
                    // Merge answers
                    data.answers.forEach((answer, idx) => {
                        if (answer !== undefined && answer !== null) {
                            allAnswers[idx] = answer;
                        }
                    });
                }

                console.log(`Imagem ${i + 1} - Texto detectado:`, data.text);
            }

            // Fill in the detected answers
            let filledCount = 0;
            allAnswers.forEach((answer, idx) => {
                if (answer !== undefined) {
                    const input = document.getElementById(`student-q${idx}`);
                    if (input) {
                        input.value = answer;
                        studentAnswers[idx] = answer;
                        input.style.backgroundColor = 'rgba(0, 255, 157, 0.2)';
                        filledCount++;
                    }
                }
            });

            if (filledCount > 0) {
                buttons.scanAI.textContent = `✅ ${filledCount} respostas detectadas!`;
                setTimeout(() => {
                    buttons.scanAI.textContent = '✨ Ler Respostas com IA (Beta)';
                }, 3000);
            } else {
                buttons.scanAI.textContent = '⚠️ Nenhuma resposta detectada';
                alert('Não foi possível detectar respostas na imagem.\n\nDicas:\n- Escreva as respostas no formato: 1) 10  2) 15  3) 7\n- Use letra legível\n- Tire foto com boa iluminação');
                setTimeout(() => {
                    buttons.scanAI.textContent = '✨ Ler Respostas com IA (Beta)';
                }, 3000);
            }

        } catch (error) {
            console.error('Erro OCR:', error);
            buttons.scanAI.textContent = '❌ Erro no OCR';
            alert('Erro ao processar imagem: ' + error.message);
            setTimeout(() => {
                buttons.scanAI.textContent = '✨ Ler Respostas com IA (Beta)';
            }, 3000);
        } finally {
            buttons.scanAI.disabled = false;
        }
    });

    // Helper to get binary components (1, 2, 4, 8, 16)
    function getComponents(sum) {
        const components = [];
        [1, 2, 4, 8, 16].forEach(val => {
            if ((sum & val) === val) {
                components.push(val);
            }
        });
        return components;
    }

    // Calculate Results with Partial Credit
    function calculateResults() {
        // Collect student answers
        inputs.gradingContainer.querySelectorAll('input').forEach(inp => {
            const idx = parseInt(inp.dataset.index);
            studentAnswers[idx] = parseInt(inp.value) || 0;
        });

        let score = 0;
        let totalQuestions = numQuestions;
        results.breakdown.innerHTML = '';

        // Remove old table if exists
        const oldTable = document.querySelector('.subject-table-container');
        if (oldTable) oldTable.remove();

        // Subject Scores Map
        const subjectScores = {};
        SUBJECTS.forEach(s => subjectScores[s.name] = { score: 0, total: 0 });

        for (let i = 0; i < numQuestions; i++) {
            const correctSum = answerKey[i] || 0;
            const studentSum = studentAnswers[i] || 0;

            const correctOptions = getComponents(correctSum);
            const studentOptions = getComponents(studentSum);

            let questionScore = 0;

            // Rule 1: Check for incorrect options (ZEROES the question)
            const hasWrongOption = studentOptions.some(opt => !correctOptions.includes(opt));

            if (hasWrongOption) {
                questionScore = 0;
            } else {
                // Rule 2: Proportional score (partial credit)
                const correctMarkedCount = studentOptions.filter(opt => correctOptions.includes(opt)).length;

                if (correctOptions.length > 0) {
                    questionScore = correctMarkedCount / correctOptions.length;
                } else {
                    questionScore = (studentSum === 0) ? 1 : 0;
                }
            }

            score += questionScore;

            // Update Subject Score
            const questionNum = i + 1;
            const subject = SUBJECTS.find(s => questionNum >= s.start && questionNum <= s.end);
            if (subject) {
                subjectScores[subject.name].score += questionScore;
                subjectScores[subject.name].total += 1;
            }

            const item = document.createElement('div');
            let resultClass = 'result-incorrect';

            if (questionScore === 1) {
                resultClass = 'result-correct';
            } else if (questionScore > 0) {
                resultClass = 'result-partial';
            }

            item.className = `result-item ${resultClass}`;
            item.textContent = i + 1;

            const percent = (questionScore * 100).toFixed(0);
            item.title = `Q${i + 1}: ${questionScore.toFixed(2)} (${percent}%)\nGab: ${correctSum}\nAluno: ${studentSum}`;

            results.breakdown.appendChild(item);
        }

        // Create Subject Score Table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'subject-table-container';
        tableContainer.innerHTML = `<h3>Desempenho por Matéria</h3>`;

        const table = document.createElement('table');
        table.className = 'subject-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Matéria</th>
                    <th>Acertos</th>
                    <th>Pontos (Máx 15/q)</th>
                </tr>
            </thead>
            <tbody>
                ${SUBJECTS.map(s => {
            const data = subjectScores[s.name];
            const rawScore = data.score; // 0 to 5
            const realPoints = rawScore * 15; // 15 pts per question
            const maxPoints = data.total * 15;
            return `
                        <tr>
                            <td>${s.name}</td>
                            <td>${rawScore.toFixed(2)} / ${data.total}</td>
                            <td><strong>${realPoints.toFixed(1)}</strong> / ${maxPoints}</td>
                        </tr>
                    `;
        }).join('')}
            </tbody>
        `;
        tableContainer.appendChild(table);

        // Insert table before breakdown
        results.breakdown.parentNode.insertBefore(tableContainer, results.breakdown);

        // Display final score (Total Points)
        const totalRealPoints = score * 15;
        results.finalScore.textContent = totalRealPoints.toFixed(1);
        results.maxScore.textContent = (totalQuestions * 15); // 900
    }

    // Step 3: Grading -> Results
    buttons.finish.addEventListener('click', () => {
        calculateResults();
        showStep('results');
    });

    // Step 4: Restart
    buttons.restart.addEventListener('click', () => {
        showStep('setup');
        inputs.examPreview.src = '';
        inputs.examPreview.classList.add('hidden');
        inputs.dropZone.querySelector('.upload-placeholder').classList.remove('hidden');
        inputs.imageControls.classList.add('hidden');
        inputs.examPhoto.value = '';
        examImages = [];
        currentImageIndex = 0;
    });
});
