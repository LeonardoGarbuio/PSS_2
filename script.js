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
        restart: document.getElementById('btn-restart')
    };

    const results = {
        finalScore: document.getElementById('final-score'),
        maxScore: document.getElementById('max-score'),
        breakdown: document.getElementById('results-breakdown')
    };

    // Pre-defined Answer Key Data
    const PRESET_KEY = {
        common: [
            6, 10, 3, 13, 11, 15, 12,  // 1-7
            14, 5, 15, 9, 3, 7, 12,    // 8-14
            14, 6, 11, 14, 10, 15, 3,  // 15-21
            9, 5, 13, 12, 13, 15, 5,   // 22-28
            7, 6, 14, 10, 12, 7, 3,    // 29-35
            9, 15, 11, 5, 13, 6, 14,   // 36-42
            10, 7, 12, 11, 15, 3, 14,  // 43-49
            5, 13, 9, 15, 14           // 50-54
        ],
        ingles: [5, 14, 15, 11, 6, 10], // 55-60
        espanhol: [15, 7, 11, 6, 9, 5]  // 55-60
    };

    // Navigation Functions
    function showStep(stepName) {
        Object.values(steps).forEach(step => step.classList.add('hidden'));
        steps[stepName].classList.remove('hidden');
    }

    // Step 1: Setup -> Key
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

    // Step 2: Key -> Setup (Back)
    buttons.backSetup.addEventListener('click', () => {
        showStep('setup');
    });

    // Generate Key Inputs
    function generateKeyInputs(language) {
        inputs.keyContainer.innerHTML = '';
        answerKey = new Array(numQuestions).fill(0);

        // Load preset data if applicable
        let presetData = [];
        if (numQuestions >= 54) {
            presetData = [...PRESET_KEY.common];
            if (numQuestions >= 60 && PRESET_KEY[language]) {
                presetData = [...presetData, ...PRESET_KEY[language]];
            }
        }

        for (let i = 1; i <= numQuestions; i++) {
            const div = document.createElement('div');
            div.className = 'question-input';

            const label = document.createElement('label');
            label.textContent = `Q${i}`;

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.dataset.index = i - 1;
            input.placeholder = 'Soma';

            // Pre-fill if data exists
            if (i <= presetData.length) {
                input.value = presetData[i - 1];
                answerKey[i - 1] = presetData[i - 1];
            }

            input.addEventListener('change', (e) => {
                answerKey[i - 1] = parseInt(e.target.value) || 0;
            });

            div.appendChild(label);
            div.appendChild(input);
            inputs.keyContainer.appendChild(div);
        }
    }

    // Step 2: Key -> Grading
    buttons.toGrading.addEventListener('click', () => {
        generateGradingInputs();
        showStep('grading');
    });

    // Step 3: Grading -> Key (Back)
    buttons.backKey.addEventListener('click', () => {
        showStep('key');
    });

    // Generate Grading Inputs
    function generateGradingInputs() {
        inputs.gradingContainer.innerHTML = '';
        studentAnswers = new Array(numQuestions).fill(null);

        for (let i = 1; i <= numQuestions; i++) {
            const div = document.createElement('div');
            div.className = 'question-input';
            div.style.flexDirection = 'row';
            div.style.justifyContent = 'space-between';
            div.style.width = '100%';

            const label = document.createElement('label');
            label.textContent = `Questão ${i}`;
            label.style.fontSize = '1rem';

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.dataset.index = i - 1;
            input.placeholder = 'Resp.';
            input.style.width = '80px';
            input.addEventListener('change', (e) => {
                studentAnswers[i - 1] = parseInt(e.target.value);
            });

            div.appendChild(label);
            div.appendChild(input);
            inputs.gradingContainer.appendChild(div);
        }
    }

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

    // Step 3: Grading -> Results
    buttons.finish.addEventListener('click', () => {
        calculateResults();
        showStep('results');
    });

    // Calculate Results
    function calculateResults() {
        let score = 0;
        let totalQuestions = numQuestions;
        results.breakdown.innerHTML = '';

        for (let i = 0; i < numQuestions; i++) {
            const correct = answerKey[i];
            const student = studentAnswers[i];
            const isCorrect = correct === student;

            if (isCorrect) {
                score++;
            }

            const item = document.createElement('div');
            item.className = `result-item ${isCorrect ? 'result-correct' : 'result-incorrect'}`;
            item.textContent = i + 1;
            item.title = `Q${i + 1}: Gabarito ${correct} | Aluno ${student || '-'}`;
            results.breakdown.appendChild(item);
        }

        results.finalScore.textContent = score;
        results.maxScore.textContent = totalQuestions;
    }

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
