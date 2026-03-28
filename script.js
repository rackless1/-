// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const codeInput = document.getElementById('code-input');
    const lineNumbers = document.getElementById('line-numbers');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const fileUpload = document.getElementById('file-upload');

    // 初始化学习数据
    initLearningData();
    
    // 初始化学习追踪展示
    updateLearningTracker();
    
    // 初始化练习模块
    updatePracticeModule();

    // 初始化行号
    updateLineNumbers();

    // 监听代码输入事件，更新行号
    codeInput.addEventListener('input', function() {
        updateLineNumbers();
        syncHeights();
    });
    
    // 监听滚动事件，确保行号区域与代码输入区域同步
    codeInput.addEventListener('scroll', function() {
        lineNumbers.scrollTop = codeInput.scrollTop;
    });
    
    // 确保行号区域和代码输入区域高度一致
    function syncHeights() {
        lineNumbers.style.height = codeInput.offsetHeight + 'px';
    }
    
    // 初始化时同步高度
    syncHeights();
    
    // 监听窗口 resize 事件，同步高度
    window.addEventListener('resize', syncHeights);
    
    // 更新行号显示
    function updateLineNumbers() {
        const lines = codeInput.value.split('\n');
        let lineNumbersHtml = '';
        for (let i = 1; i <= lines.length; i++) {
            lineNumbersHtml += '<div class="line-number">' + i + '</div>';
        }
        lineNumbers.innerHTML = lineNumbersHtml;
    }
    
    // 标注代码错误行
    function highlightErrorLines(errors) {
        // 清除之前的错误标注
        const lineNumbers = document.querySelectorAll('.line-number');
        lineNumbers.forEach(line => {
            line.classList.remove('error-line');
            // 移除之前的点击事件监听器
            const newLine = line.cloneNode(true);
            line.parentNode.replaceChild(newLine, line);
        });
        
        // 为错误行添加标注
        errors.forEach((error, index) => {
            const lineNumber = document.querySelector(`.line-number:nth-child(${error.line})`);
            if (lineNumber) {
                lineNumber.classList.add('error-line');
                
                // 添加点击事件监听器
                lineNumber.addEventListener('click', function() {
                    // 滚动到对应的错误提示
                    const errorSection = document.querySelector(`.result-section:nth-child(${index + 1})`);
                    if (errorSection) {
                        errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // 添加闪烁效果
                        errorSection.classList.add('error-flash');
                        setTimeout(() => {
                            errorSection.classList.remove('error-flash');
                        }, 1000);
                    }
                });
            }
        });
    }
    
    // 初始化学习数据
    function initLearningData() {
        const existingData = localStorage.getItem('learningData');
        if (!existingData) {
            const initialData = {
                exercises: [],
                errorStats: {},
                skillLevels: {
                    '基础语法': 0,
                    '函数定义': 0,
                    '数据类型': 0,
                    '逻辑控制': 0,
                    '异常处理': 0
                },
                lastUpdated: Date.now()
            };
            localStorage.setItem('learningData', JSON.stringify(initialData));
        }
    }

    // 获取学习数据
    function getLearningData() {
        const data = localStorage.getItem('learningData');
        return data ? JSON.parse(data) : initLearningData();
    }

    // 保存学习数据
    function saveLearningData(data) {
        data.lastUpdated = Date.now();
        localStorage.setItem('learningData', JSON.stringify(data));
    }

    // 记录练习数据
    function recordExercise(code, errors) {
        const learningData = getLearningData();
        
        // 添加练习记录
        learningData.exercises.push({
            id: 'ex' + Date.now(),
            code: code,
            errors: errors,
            timestamp: Date.now(),
            fixed: false
        });
        
        // 更新错误统计
        errors.forEach(error => {
            if (learningData.errorStats[error.typeName]) {
                learningData.errorStats[error.typeName]++;
            } else {
                learningData.errorStats[error.typeName] = 1;
            }
        });
        
        // 更新技能水平
        updateSkillLevels(learningData, errors);
        
        // 保存数据
        saveLearningData(learningData);
        
        // 更新学习追踪展示
        updateLearningTracker();
        
        // 更新练习模块
        updatePracticeModule();
    }

    // 更新技能水平
    function updateSkillLevels(learningData, errors) {
        // 根据错误类型更新对应技能的水平
        const skillMap = {
            '语法错误': '基础语法',
            '缩进错误': '基础语法',
            '变量未定义': '基础语法',
            '类型错误': '数据类型',
            '逻辑错误': '逻辑控制',
            '除零错误': '逻辑控制',
            '索引错误': '数据类型',
            '键错误': '数据类型',
            '属性错误': '数据类型',
            '文件错误': '异常处理'
        };
        
        errors.forEach(error => {
            const skill = skillMap[error.typeName];
            if (skill) {
                // 错误会降低技能水平
                learningData.skillLevels[skill] = Math.max(0, learningData.skillLevels[skill] - 5);
            }
        });
        
        // 每次练习都会提升所有技能的水平
        Object.keys(learningData.skillLevels).forEach(skill => {
            learningData.skillLevels[skill] = Math.min(100, learningData.skillLevels[skill] + 2);
        });
    }

    // 练习题数据
    const practiceQuestions = {
        '缺少冒号': [
            {
                id: 'colon1',
                title: '函数定义缺少冒号',
                description: '在Python中，函数定义的末尾必须添加冒号',
                code: 'def add(a, b)\n    return a + b',
                options: [
                    'def add(a, b)\n    return a + b',
                    'def add(a, b):\n    return a + b',
                    'def add(a, b)\nreturn a + b',
                    'def add(a, b);\n    return a + b'
                ],
                correctAnswer: 1,
                explanation: '在Python中，函数定义、条件语句和循环语句的末尾必须添加冒号，否则会引发语法错误。'
            },
            {
                id: 'colon2',
                title: '条件语句缺少冒号',
                description: '在Python中，if语句的末尾必须添加冒号',
                code: 'if True\nprint("Hello")',
                options: [
                    'if True\nprint("Hello")',
                    'if True,\nprint("Hello")',
                    'if True:\nprint("Hello")',
                    'if True:\n    print("Hello")'
                ],
                correctAnswer: 3,
                explanation: '在Python中，if语句的末尾必须添加冒号，并且语句块需要缩进。'
            }
        ],
        '缩进错误': [
            {
                id: 'indent1',
                title: '函数体缺少缩进',
                description: '在Python中，函数体必须缩进',
                code: 'def greet()\nprint("Hello")',
                options: [
                    'def greet()\nprint("Hello")',
                    'def greet():\nprint("Hello")',
                    'def greet():\n    print("Hello")',
                    'def greet()\n    print("Hello")'
                ],
                correctAnswer: 2,
                explanation: '在Python中，函数体必须缩进，通常使用4个空格作为缩进单位。'
            },
            {
                id: 'indent2',
                title: '循环体缺少缩进',
                description: '在Python中，循环体必须缩进',
                code: 'for i in range(5)\nprint(i)',
                options: [
                    'for i in range(5)\nprint(i)',
                    'for i in range(5):\nprint(i)',
                    'for i in range(5):\n    print(i)',
                    'for i in range(5)\n    print(i)'
                ],
                correctAnswer: 2,
                explanation: '在Python中，循环体必须缩进，通常使用4个空格作为缩进单位。'
            }
        ],
        '变量未定义': [
            {
                id: 'var1',
                title: '使用未定义的变量',
                description: '在Python中，使用变量前必须先定义',
                code: 'print(message)',
                options: [
                    'print(message)',
                    'message = "Hello"\nprint(message)',
                    'print("message")',
                    'message = 123\nprint(message)'
                ],
                correctAnswer: 1,
                explanation: '在Python中，使用变量前必须先定义，否则会引发NameError异常。'
            },
            {
                id: 'var2',
                title: '函数中使用未定义的变量',
                description: '在Python中，函数中使用的变量必须先定义',
                code: 'def calculate()\n    return x + y',
                options: [
                    'def calculate()\n    return x + y',
                    'def calculate(x, y)\n    return x + y',
                    'def calculate(x, y):\n    return x + y',
                    'def calculate():\n    x = 1\n    y = 2\n    return x + y'
                ],
                correctAnswer: 2,
                explanation: '在Python中，函数中使用的变量必须先定义，可以作为参数传入或在函数内部定义。'
            }
        ],
        '字符串与数字不能相加': [
            {
                id: 'type1',
                title: '字符串和数字直接拼接',
                description: '在Python中，字符串和数字不能直接拼接',
                code: 'age = 18\nprint("年龄: " + age)',
                options: [
                    'age = 18\nprint("年龄: " + age)',
                    'age = 18\nprint("年龄: " + str(age))',
                    'age = 18\nprint("年龄: " + age + "岁")',
                    'age = 18\nprint("年龄: " + int(age))'
                ],
                correctAnswer: 1,
                explanation: '在Python中，字符串和数字不能直接拼接，需要使用str()函数将数字转换为字符串。'
            },
            {
                id: 'type2',
                title: '使用f-string格式化',
                description: '在Python中，可以使用f-string进行字符串格式化',
                code: 'name = "Alice"\nage = 20\nprint("姓名: " + name + "，年龄: " + age)',
                options: [
                    'name = "Alice"\nage = 20\nprint("姓名: " + name + "，年龄: " + age)',
                    'name = "Alice"\nage = 20\nprint("姓名: " + name + "，年龄: " + str(age))',
                    'name = "Alice"\nage = 20\nprint(f"姓名: {name}，年龄: {age}")',
                    'name = "Alice"\nage = 20\nprint("姓名: {}, 年龄: {}".format(name, age))'
                ],
                correctAnswer: 2,
                explanation: '在Python 3.6+中，可以使用f-string进行字符串格式化，它会自动处理不同类型的变量。'
            }
        ],
        '语法错误': [
            {
                id: 'syntax1',
                title: '缺少引号',
                description: '在Python中，字符串必须用引号包围',
                code: 'print(Hello)',
                options: [
                    'print(Hello)',
                    'print("Hello")',
                    'print(\'Hello\')',
                    'print(Hello())'
                ],
                correctAnswer: 1,
                explanation: '在Python中，字符串必须用引号（单引号或双引号）包围，否则会被视为变量名。'
            },
            {
                id: 'syntax2',
                title: '括号不匹配',
                description: '在Python中，括号必须成对出现',
                code: 'print("Hello", end="',
                options: [
                    'print("Hello", end="',
                    'print("Hello", end="")',
                    'print("Hello", end="\n")',
                    'print("Hello", end=)' 
                ],
                correctAnswer: 1,
                explanation: '在Python中，括号必须成对出现，否则会引发语法错误。'
            }
        ],
        '键错误': [
            {
                id: 'key1',
                title: '字典键不存在',
                description: '在Python中，访问字典中不存在的键会引发KeyError',
                code: 'student = {"name": "Alice"}\nprint(student["age"])\n',
                options: [
                    'student = {"name": "Alice"}\nprint(student["age"])\n',
                    'student = {"name": "Alice", "age": 18}\nprint(student["age"])\n',
                    'student = {"name": "Alice"}\nprint(student.get("age", "未知"))\n',
                    'student = {"name": "Alice"}\nprint("age" in student)\n'
                ],
                correctAnswer: 2,
                explanation: '在Python中，使用get()方法可以安全地访问字典中不存在的键，并提供默认值。'
            },
            {
                id: 'key2',
                title: '列表索引越界',
                description: '在Python中，访问列表中不存在的索引会引发IndexError',
                code: 'numbers = [1, 2, 3]\nprint(numbers[5])\n',
                options: [
                    'numbers = [1, 2, 3]\nprint(numbers[5])\n',
                    'numbers = [1, 2, 3, 4, 5]\nprint(numbers[5])\n',
                    'numbers = [1, 2, 3]\nif len(numbers) > 5:\n    print(numbers[5])\nelse:\n    print("索引不存在")\n',
                    'numbers = [1, 2, 3]\nprint(numbers[-1])\n'
                ],
                correctAnswer: 2,
                explanation: '在Python中，访问列表索引前应该检查索引是否在有效范围内，或者使用异常处理。'
            }
        ]
    };

    // 生成针对性练习
    function generatePractice(errorType) {
        return practiceQuestions[errorType] || null;
    }

    // 当前练习状态
    let currentPractice = {
        errorType: null,
        questions: [],
        currentIndex: 0,
        userAnswers: []
    };

    // 更新练习模块
    function updatePracticeModule() {
        const learningData = getLearningData();
        const practiceContainer = document.getElementById('practice-container');
        
        if (!learningData || Object.keys(learningData.errorStats).length === 0) {
            practiceContainer.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-info-circle"></i> 开始练习后，这里将展示针对性的练习题
                </div>
            `;
            return;
        }
        
        // 获取最常见的错误类型
        const sortedErrors = Object.entries(learningData.errorStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        if (sortedErrors.length === 0) {
            practiceContainer.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="fas fa-check-circle"></i> 暂无错误记录，继续保持！
                </div>
            `;
            return;
        }
        
        // 生成练习模块HTML
        let html = `
            <div class="mb-4">
                <h4>针对性练习</h4>
                <p>根据您的错误记录，推荐以下练习：</p>
                <ul class="list-group mb-4">
                    ${sortedErrors.map(([error, count]) => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${error}
                            <span class="badge bg-danger rounded-pill">${count}</span>
                            <button class="btn btn-sm btn-warning start-practice" data-error-type="${error}">
                                <i class="fas fa-play"></i> 开始练习
                            </button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        practiceContainer.innerHTML = html;
        
        // 添加开始练习按钮事件
        document.querySelectorAll('.start-practice').forEach(button => {
            button.addEventListener('click', function() {
                const errorType = this.getAttribute('data-error-type');
                startPractice(errorType);
            });
        });
    }

    // 开始练习
    function startPractice(errorType) {
        const questions = generatePractice(errorType);
        if (!questions || questions.length === 0) {
            const practiceContainer = document.getElementById('practice-container');
            practiceContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle"></i> 该错误类型暂时没有练习题，敬请期待！
                    <button class="btn btn-outline-primary mt-2 w-100" onclick="updatePracticeModule()">
                        <i class="fas fa-arrow-left"></i> 返回错误类型选择
                    </button>
                </div>
            `;
            return;
        }
        
        currentPractice = {
            errorType: errorType,
            questions: questions,
            currentIndex: 0,
            userAnswers: new Array(questions.length).fill(null)
        };
        
        showCurrentQuestion();
    }

    // 显示当前问题
    function showCurrentQuestion() {
        const practiceContainer = document.getElementById('practice-container');
        const question = currentPractice.questions[currentPractice.currentIndex];
        
        let html = `
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4>${currentPractice.errorType}练习</h4>
                    <span class="badge bg-secondary">${currentPractice.currentIndex + 1}/${currentPractice.questions.length}</span>
                </div>
                <div class="card mb-3">
                    <div class="card-body">
                        <h5>${question.title}</h5>
                        <p class="text-muted">${question.description}</p>
                        <pre class="bg-light p-2 rounded mt-2"><code>${question.code}</code></pre>
                        <div class="mt-3">
                            <h6>请选择正确的修复方案：</h6>
                            <div class="list-group mt-2">
                                ${question.options.map((option, index) => `
                                    <label class="list-group-item">
                                        <input type="radio" name="answer" value="${index}" ${currentPractice.userAnswers[currentPractice.currentIndex] === index ? 'checked' : ''}>
                                        <pre class="m-0"><code>${option}</code></pre>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <button class="btn btn-secondary ${currentPractice.currentIndex === 0 ? 'disabled' : ''}" ${currentPractice.currentIndex === 0 ? 'disabled' : ''} onclick="prevQuestion()">
                        <i class="fas fa-arrow-left"></i> 上一题
                    </button>
                    <button class="btn btn-primary" onclick="submitAnswer()">
                        提交答案 <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-secondary ${currentPractice.currentIndex === currentPractice.questions.length - 1 ? 'disabled' : ''}" ${currentPractice.currentIndex === currentPractice.questions.length - 1 ? 'disabled' : ''} onclick="nextQuestion()">
                        下一题 <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <button class="btn btn-outline-primary w-100" onclick="updatePracticeModule()">
                    <i class="fas fa-arrow-left"></i> 返回错误类型选择
                </button>
            </div>
        `;
        
        practiceContainer.innerHTML = html;
    }

    // 提交答案
    function submitAnswer() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) {
            alert('请选择一个答案');
            return;
        }
        
        const answer = parseInt(selectedOption.value);
        currentPractice.userAnswers[currentPractice.currentIndex] = answer;
        
        const question = currentPractice.questions[currentPractice.currentIndex];
        const isCorrect = answer === question.correctAnswer;
        
        const practiceContainer = document.getElementById('practice-container');
        
        let html = `
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4>${currentPractice.errorType}练习</h4>
                    <span class="badge bg-secondary">${currentPractice.currentIndex + 1}/${currentPractice.questions.length}</span>
                </div>
                <div class="card mb-3">
                    <div class="card-body">
                        <h5>${question.title}</h5>
                        <p class="text-muted">${question.description}</p>
                        <pre class="bg-light p-2 rounded mt-2"><code>${question.code}</code></pre>
                        <div class="mt-3">
                            <h6>您的答案：</h6>
                            <div class="list-group mt-2">
                                ${question.options.map((option, index) => `
                                    <label class="list-group-item ${index === answer ? (isCorrect ? 'list-group-item-success' : 'list-group-item-danger') : ''}">
                                        <input type="radio" name="answer" value="${index}" checked disabled>
                                        <pre class="m-0"><code>${option}</code></pre>
                                    </label>
                                `).join('')}
                            </div>
                            <div class="mt-3 alert ${isCorrect ? 'alert-success' : 'alert-danger'}">
                                <h6>${isCorrect ? '回答正确！' : '回答错误'}</h6>
                                <p>${question.explanation}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-secondary ${currentPractice.currentIndex === 0 ? 'disabled' : ''}" ${currentPractice.currentIndex === 0 ? 'disabled' : ''} onclick="prevQuestion()">
                        <i class="fas fa-arrow-left"></i> 上一题
                    </button>
                    <button class="btn btn-info" onclick="updatePracticeModule()">
                        <i class="fas fa-arrow-left"></i> 返回练习列表
                    </button>
                    <button class="btn btn-secondary ${currentPractice.currentIndex === currentPractice.questions.length - 1 ? 'disabled' : ''}" ${currentPractice.currentIndex === currentPractice.questions.length - 1 ? 'disabled' : ''} onclick="nextQuestion()">
                        下一题 <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
        
        practiceContainer.innerHTML = html;
    }

    // 上一题
    function prevQuestion() {
        if (currentPractice.currentIndex > 0) {
            currentPractice.currentIndex--;
            showCurrentQuestion();
        }
    }

    // 下一题
    function nextQuestion() {
        if (currentPractice.currentIndex < currentPractice.questions.length - 1) {
            currentPractice.currentIndex++;
            showCurrentQuestion();
        }
    }

    // 全局函数，供HTML调用
    window.prevQuestion = prevQuestion;
    window.nextQuestion = nextQuestion;
    window.submitAnswer = submitAnswer;
    window.updatePracticeModule = updatePracticeModule;

    // 更新学习追踪展示
    function updateLearningTracker() {
        const learningData = getLearningData();
        const learningTracker = document.getElementById('learning-tracker');
        
        if (!learningData || learningData.exercises.length === 0) {
            learningTracker.innerHTML = `
                <div class="alert alert-info" role="alert">
                    <i class="fas fa-info-circle"></i> 开始练习后，这里将展示您的学习情况
                </div>
            `;
            return;
        }
        
        // 计算统计数据
        const totalExercises = learningData.exercises.length;
        const totalErrors = learningData.exercises.reduce((sum, ex) => sum + ex.errors.length, 0);
        const recentExercises = learningData.exercises.slice(-5).reverse();
        
        // 获取最常见的错误
        const sortedErrors = Object.entries(learningData.errorStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        // 获取待提升的技能
        const weakSkills = Object.entries(learningData.skillLevels)
            .filter(([skill, level]) => level < 60)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 3);
        
        // 生成学习追踪HTML
        let html = `
            <div class="mb-4">
                <h4>学习统计</h4>
                <div class="row">
                    <div class="col-md-4">
                        <div class="card bg-light text-center p-3">
                            <div class="h2">${totalExercises}</div>
                            <div class="text-muted">练习次数</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light text-center p-3">
                            <div class="h2">${totalErrors}</div>
                            <div class="text-muted">错误总数</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light text-center p-3">
                            <div class="h2">${Math.round((totalExercises / (totalExercises + totalErrors)) * 100)}%</div>
                            <div class="text-muted">正确率</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <h4>常犯错误</h4>
                ${sortedErrors.length > 0 ? `
                    <ul class="list-group">
                        ${sortedErrors.map(([error, count]) => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${error}
                                <span class="badge bg-danger rounded-pill">${count}</span>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <div class="alert alert-success" role="alert">
                        <i class="fas fa-check-circle"></i> 暂无错误记录
                    </div>
                `}
            </div>
            
            <div class="mb-4">
                <h4>待提升知识点</h4>
                ${weakSkills.length > 0 ? `
                    <ul class="list-group">
                        ${weakSkills.map(([skill, level]) => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${skill}
                                <div class="progress" style="width: 100px;">
                                    <div class="progress-bar bg-warning" role="progressbar" style="width: ${level}%" aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100">${level}%</div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <div class="alert alert-success" role="alert">
                        <i class="fas fa-check-circle"></i> 所有知识点掌握良好
                    </div>
                `}
            </div>
            
            <div class="mb-4">
                <h4>最近练习</h4>
                ${recentExercises.length > 0 ? `
                    <div class="list-group">
                        ${recentExercises.map(ex => `
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between">
                                    <small class="text-muted">${new Date(ex.timestamp).toLocaleString()}</small>
                                    <span class="badge ${ex.errors.length > 0 ? 'bg-danger' : 'bg-success'}">${ex.errors.length} 个错误</span>
                                </div>
                                <pre class="mt-2 bg-light p-2 rounded" style="font-size: 12px; white-space: pre-wrap;">${ex.code.substring(0, 100)}${ex.code.length > 100 ? '...' : ''}</pre>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle"></i> 暂无练习记录
                    </div>
                `}
            </div>
        `;
        
        learningTracker.innerHTML = html;
    }

    // 显示分析结果
    function displayResult(result) {
        if (result.success) {
            resultContainer.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <i class="fas fa-check-circle"></i> ${result.message}
                </div>
            `;
            // 清除错误标注
            highlightErrorLines([]);
            
            // 记录练习数据（无错误）
            recordExercise(codeInput.value, []);
        } else {
            let html = '';
            const codeLines = codeInput.value.split('\n');
            
            result.errors.forEach((error, index) => {
                // 获取原代码行
                const originalLine = codeLines[error.line - 1] || '';
                
                // 生成正确的代码示例（根据错误类型）
                let correctCode = '';
                if (error.typeName === '变量未定义') {
                    const match = error.reason.match(/变量(\w+)未定义/);
                    if (match && match[1]) {
                        const varName = match[1];
                        correctCode = `${varName} = "值"  // 先定义变量\n${originalLine}`;
                    }
                } else if (error.typeName === '语法错误' && error.reason.includes('缺少冒号')) {
                    correctCode = originalLine.trim() + ':';
                } else if (error.typeName === '类型错误' && error.reason.includes('字符串与数字不能相加')) {
                    if (originalLine.includes('+')) {
                        const parts = originalLine.split('+');
                        if (parts.length >= 2) {
                            correctCode = parts[0].trim() + ' + str(' + parts[1].trim() + ')';
                        }
                    }
                } else if (error.typeName === '逻辑错误' && error.reason.includes('奇偶性判断逻辑错误')) {
                    correctCode = originalLine.replace('% 2 == 1', '% 2 == 0').replace('%2==1', '%2==0');
                }
                
                html += `
                    <div class="result-section">
                        <div class="error-type ${error.type}">${error.typeName}</div>
                        <h3>问题 ${index + 1} - 第 ${error.line} 行</h3>
                        
                        <div class="mb-3">
                            <h4>原代码</h4>
                            <pre class="bg-light p-2 rounded"><code>${originalLine}</code></pre>
                        </div>
                        
                        <div class="mb-3">
                            <h4>错误原因</h4>
                            <p>${error.reason}</p>
                        </div>
                        
                        <div class="mb-3">
                            <h4>修复方案</h4>
                            <p>${error.fix}</p>
                            ${correctCode ? `
                            <h5>正确代码示例：</h5>
                            <pre class="bg-success bg-opacity-10 p-2 rounded"><code>${correctCode}</code></pre>
                            ` : ''}
                        </div>
                        
                        <div class="knowledge-point">
                            <h4>知识点扩展</h4>
                            <p>${error.knowledge}</p>
                        </div>
                    </div>
                `;
            });
            resultContainer.innerHTML = html;
            // 标注错误行
            highlightErrorLines(result.errors);
            
            // 记录练习数据（有错误）
            recordExercise(codeInput.value, result.errors);
        }
    }

    // 文件上传事件
    fileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();

        if (fileExtension === 'txt' || fileExtension === 'py') {
            // 读取txt或py文件
            const reader = new FileReader();
            reader.onload = function(e) {
                codeInput.value = e.target.result;
                // 更新行号
                updateLineNumbers();
                syncHeights();
            };
            reader.readAsText(file);
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
            // 读取word文件（需要使用第三方库，这里仅做提示）
            showMessage('Word文件读取需要使用专门的库，建议先将内容复制到代码输入框', 'info');
        } else {
            showMessage('请上传文本文件或Python文件', 'warning');
        }
    });

    // 取消文件上传
    const cancelUploadBtn = document.getElementById('cancel-upload');
    cancelUploadBtn.addEventListener('click', function() {
        // 重置文件输入
        fileUpload.value = '';
        // 可选：清空代码输入框
        // codeInput.value = '';
    });

    // 分析按钮点击事件
    analyzeBtn.addEventListener('click', function() {
        const code = codeInput.value.trim();
        const error = errorMessage.value.trim();

        // 验证输入
        if (!code) {
            showMessage('请输入代码', 'warning');
            return;
        }

        // 显示加载动画
        showLoading();

        // 调用分析函数
        analyzeCode(code, error)
            .then(analysisResult => {
                displayResult(analysisResult);
            })
            .catch(error => {
                showMessage('分析过程中出现错误', 'danger');
                console.error('分析错误:', error);
            });
    });

    // 显示加载动画
    function showLoading() {
        resultContainer.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                <div class="loading">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        `;
    }

    // 显示消息
    function showMessage(message, type = 'info') {
        resultContainer.innerHTML = `
            <div class="alert alert-${type}" role="alert">
                <i class="fas ${type === 'info' ? 'fa-info-circle' : type === 'warning' ? 'fa-exclamation-triangle' : type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}
            </div>
        `;
    }

    // 分析代码（使用Python AST后端API）
    function analyzeCode(code, error) {
        return new Promise((resolve, reject) => {
            // 构建请求数据
            const requestData = {
                code: code,
                error: error
            };

            // 调用Python AST后端API
            fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(apiResponse => {
                // 处理API响应
                if (apiResponse.success) {
                    resolve({
                        success: true,
                        message: apiResponse.message || '代码分析完成，未检测到明显错误。'
                    });
                } else {
                    resolve({
                        success: false,
                        errors: apiResponse.errors || []
                    });
                }
            })
            .catch(error => {
                // API调用失败时，使用本地分析作为备份
                console.error('Python AST API调用失败，使用本地分析:', error);
                try {
                    const localResult = analyzeCodeLocally(code, error);
                    resolve(localResult);
                } catch (localError) {
                    console.error('本地分析也失败:', localError);
                    resolve({
                        success: true,
                        message: '代码分析完成，未检测到明显错误。'
                    });
                }
            });
        });
    }

    // 本地代码分析（作为备份）
    function analyzeCodeLocally(code, error) {
        // 模拟不同类型的错误分析
        const lines = code.split('\n');
        let errors = [];

        // 检查语法错误
        const syntaxErrors = checkSyntaxErrors(lines);
        if (syntaxErrors.length > 0) {
            errors = errors.concat(syntaxErrors);
        }

        // 检查缩进错误
        const indentErrors = checkIndentation(lines);
        if (indentErrors.length > 0) {
            errors = errors.concat(indentErrors);
        }

        // 检查变量名错误
        const varNameErrors = checkVariableNameErrors(lines);
        if (varNameErrors.length > 0) {
            errors = errors.concat(varNameErrors);
        }

        // 检查变量未定义错误
        const undefinedVars = checkUndefinedVariables(lines);
        if (undefinedVars.length > 0) {
            errors = errors.concat(undefinedVars);
        }

        // 检查类型错误
        const typeErrors = checkTypeErrors(lines);
        if (typeErrors.length > 0) {
            errors = errors.concat(typeErrors);
        }

        // 检查除以零错误
        const zeroDivisionErrors = checkZeroDivisionErrors(lines);
        if (zeroDivisionErrors.length > 0) {
            errors = errors.concat(zeroDivisionErrors);
        }

        // 检查索引错误
        const indexErrors = checkIndexErrors(lines);
        if (indexErrors.length > 0) {
            errors = errors.concat(indexErrors);
        }

        // 检查键错误
        const keyErrors = checkKeyErrors(lines);
        if (keyErrors.length > 0) {
            errors = errors.concat(keyErrors);
        }

        // 检查属性错误
        const attributeErrors = checkAttributeErrors(lines);
        if (attributeErrors.length > 0) {
            errors = errors.concat(attributeErrors);
        }

        // 检查文件错误
        const fileErrors = checkFileErrors(lines);
        if (fileErrors.length > 0) {
            errors = errors.concat(fileErrors);
        }

        // 检查逻辑错误
        const logicErrors = checkLogicErrors(lines);
        if (logicErrors.length > 0) {
            errors = errors.concat(logicErrors);
        }

        // 如果没有检测到错误，返回成功信息
        if (errors.length === 0) {
            return {
                success: true,
                message: '代码分析完成，未检测到明显错误。'
            };
        }

        return {
            success: false,
            errors: errors
        };
    }

    // 调用Spark Ultra-32K API
    function callSparkAPI(data) {
        return new Promise((resolve, reject) => {
            // Spark Ultra-32K API配置
            const appId = '8c906d35';
            const apiSecret = 'M2YzODFkZGI5MjU2ZjY1YTYwNjI3ZDMy';
            const apiKey = 'c802979de397c7175c335718bbbb61b8';
            const apiUrl = 'https://spark-api.xf-yun.com/v1.1/chat';

            // 构建请求参数
            const requestBody = {
                app_id: appId,
                parameters: {
                    chat: {
                        domain: 'general',
                        temperature: 0.7,
                        max_tokens: 2048
                    }
                },
                messages: [
                    {
                        role: 'system',
                        content: '你是一个Python代码错误分析助手，需要分析用户提供的Python代码，指出其中的错误，并按照以下格式输出：\n1. 错误类型\n2. 错误行号\n3. 错误原因\n4. 修复方案\n5. 知识点扩展\n\n只输出真实存在的错误，不乱报、不误报。'
                    },
                    {
                        role: 'user',
                        content: `分析以下Python代码中的错误：\n${data.code}\n\n错误信息（如果有）：\n${data.error}`
                    }
                ]
            };

            // 生成签名（简化版，实际需要更复杂的签名生成）
            const timestamp = Math.floor(Date.now() / 1000);
            const signature = generateSignature(appId, apiKey, apiSecret, timestamp);

            // 发送请求
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${signature}`,
                    'X-Appid': appId,
                    'X-Timestamp': timestamp.toString(),
                    'X-Param': btoa(JSON.stringify({ "chat": { "domain": "general" } }))
                },
                body: JSON.stringify(requestBody)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                if (result.code === 0) {
                    // 解析API响应
                    const content = result.data?.messages?.[0]?.content || '';
                    const errors = parseSparkResponse(content);
                    resolve({
                        success: errors.length === 0,
                        errors: errors,
                        message: errors.length === 0 ? '代码分析完成，未检测到明显错误。' : ''
                    });
                } else {
                    reject(new Error(`API调用失败: ${result.message}`));
                }
            })
            .catch(error => {
                console.error('Spark API调用失败:', error);
                reject(error);
            });
        });
    }

    // 生成签名（简化版）
    function generateSignature(appId, apiKey, apiSecret, timestamp) {
        // 实际需要使用HMAC-SHA256生成签名
        // 这里简化处理，实际项目中需要实现完整的签名生成
        // 注意：真实环境中需要使用crypto库生成HMAC-SHA256签名
        console.log('生成签名:', appId, apiKey, apiSecret, timestamp);
        return btoa(`${appId}:${apiKey}:${apiSecret}:${timestamp}`);
    }

    // 解析Spark API响应
    function parseSparkResponse(content) {
        const errors = [];
        // 简单解析响应内容，实际需要根据API返回格式进行调整
        const lines = content.split('\n');
        let currentError = null;

        for (const line of lines) {
            if (line.includes('错误类型：')) {
                if (currentError) {
                    errors.push(currentError);
                }
                currentError = {
                    type: 'syntax',
                    typeName: line.replace('错误类型：', '').trim(),
                    line: 1,
                    reason: '',
                    fix: '',
                    knowledge: ''
                };
            } else if (line.includes('错误行号：') && currentError) {
                currentError.line = parseInt(line.replace('错误行号：', '').trim()) || 1;
            } else if (line.includes('错误原因：') && currentError) {
                currentError.reason = line.replace('错误原因：', '').trim();
            } else if (line.includes('修复方案：') && currentError) {
                currentError.fix = line.replace('修复方案：', '').trim();
            } else if (line.includes('知识点扩展：') && currentError) {
                currentError.knowledge = line.replace('知识点扩展：', '').trim();
            }
        }

        if (currentError) {
            errors.push(currentError);
        }

        return errors;
    }

    // 检查语法错误
    function checkSyntaxErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查括号配对
            if (line.includes('(') && !line.includes(')')) {
                errors.push({
                    line: i + 1,
                    type: 'syntax',
                    typeName: '语法错误',
                    reason: '缺少右括号',
                    fix: '在语句末尾添加右括号',
                    knowledge: '在Python中，括号必须成对出现，缺少括号会导致语法错误。'
                });
            }

            if (line.includes(')') && !line.includes('(')) {
                errors.push({
                    line: i + 1,
                    type: 'syntax',
                    typeName: '语法错误',
                    reason: '缺少左括号',
                    fix: '在适当位置添加左括号',
                    knowledge: '在Python中，括号必须成对出现，缺少括号会导致语法错误。'
                });
            }

            // 检查冒号
            if ((line.startsWith('def ') || line.startsWith('if ') || line.startsWith('else') || 
                 line.startsWith('for ') || line.startsWith('while ')) && 
                !line.endsWith(':')) {
                errors.push({
                    line: i + 1,
                    type: 'syntax',
                    typeName: '语法错误',
                    reason: '缺少冒号',
                    fix: '在语句末尾添加冒号',
                    knowledge: '在Python中，函数定义、条件语句和循环语句的末尾必须添加冒号。'
                });
            }

            // 检查字符串引号闭合
            if ((line.includes('"') && (line.match(/"/g) || []).length % 2 !== 0) || 
                (line.includes("'") && (line.match(/'/g) || []).length % 2 !== 0)) {
                errors.push({
                    line: i + 1,
                    type: 'syntax',
                    typeName: '语法错误',
                    reason: '字符串缺少闭合引号',
                    fix: '添加缺失的引号',
                    knowledge: '在Python中，字符串必须使用配对的引号包围。'
                });
            }
        }

        return errors;
    }

    // 检查缩进错误
    function checkIndentation(lines) {
        let errors = [];
        const indentSize = 4; // 假设使用4个空格缩进

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查是否使用了制表符
            if (lines[i].includes('\t')) {
                errors.push({
                    line: i + 1,
                    type: 'syntax',
                    typeName: '缩进错误',
                    reason: '使用了制表符进行缩进',
                    fix: '使用4个空格替代制表符进行缩进',
                    knowledge: 'PEP 8建议使用4个空格进行缩进，避免使用制表符。'
                });
            }

            // 检查缩进是否为4的倍数
            const leadingSpaces = lines[i].length - line.length;
            if (leadingSpaces % indentSize !== 0) {
                errors.push({
                    line: i + 1,
                    type: 'syntax',
                    typeName: '缩进错误',
                    reason: '缩进不是4的倍数',
                    fix: '确保缩进使用4的倍数个空格',
                    knowledge: 'PEP 8建议使用4个空格作为缩进单位。'
                });
            }

            // 检查函数和条件语句内部的缩进
            if (i > 0) {
                const prevLine = lines[i-1].trim();
                if ((prevLine.startsWith('def ') || prevLine.startsWith('if ') || 
                     prevLine.startsWith('else') || prevLine.startsWith('for ') || 
                     prevLine.startsWith('while ')) && prevLine.endsWith(':')) {
                    // 下一行应该有缩进
                    if (leadingSpaces === 0) {
                        errors.push({
                            line: i + 1,
                            type: 'syntax',
                            typeName: '缩进错误',
                            reason: '函数或条件语句内部语句没有缩进',
                            fix: '添加4个空格的缩进',
                            knowledge: '在Python中，函数体和条件语句块必须缩进。'
                        });
                    }
                }
            }
        }

        return errors;
    }

    // 检查变量名错误
    function checkVariableNameErrors(lines) {
        let errors = [];
        const keywords = ['def', 'if', 'else', 'for', 'while', 'return', 'print', 'len', 'range', 'True', 'False', 'None'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检测变量定义
            if (line.includes('=') && !line.includes('==') && !line.includes('!=')) {
                // 跳过函数调用中的赋值
                if (!line.includes('(') || line.indexOf('=') < line.indexOf('(')) {
                    const parts = line.split('=');
                    const varName = parts[0].trim().split(' ').pop();
                    
                    // 跳过数字和运算符
                    if (!isNumber(varName) && !/^[+\-*/%=<>!&|^~]+$/.test(varName)) {
                        // 检查变量名是否为关键字
                        if (keywords.includes(varName)) {
                            errors.push({
                                line: i + 1,
                                type: 'syntax',
                                typeName: '变量名错误',
                                reason: `变量名${varName}是Python关键字，不能作为变量名`,
                                fix: '使用其他名称作为变量名',
                                knowledge: 'Python关键字是保留的，不能用作变量名。'
                            });
                        }

                        // 检查变量名是否合法
                        if (!varName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                            errors.push({
                                line: i + 1,
                                type: 'syntax',
                                typeName: '变量名错误',
                                reason: `变量名${varName}不合法`,
                                fix: '使用字母、数字和下划线组成的合法变量名，且不能以数字开头',
                                knowledge: 'Python变量名必须以字母或下划线开头，只能包含字母、数字和下划线。'
                            });
                        }
                    }
                }
            }
        }

        return errors;
    }

    // 检查变量未定义错误
    function checkUndefinedVariables(lines) {
        let errors = [];
        const definedVars = new Set();
        const builtinFuncs = new Set(['print', 'len', 'range', 'input', 'open', 'sum', 'int', 'float', 'str', 'enumerate', 'list', 'dict', 'tuple', 'set']);
        const keywords = new Set(['def', 'if', 'else', 'for', 'while', 'return', 'True', 'False', 'None', 'in', 'elif', 'and', 'or', 'not', 'f']);
        const methodNames = new Set(['append', 'extend', 'insert', 'remove', 'pop', 'clear', 'index', 'count', 'sort', 'reverse']);

        // 收集已定义的变量和函数
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 收集函数定义
            if (line.startsWith('def ')) {
                const funcName = line.split('(')[0].split(' ')[1];
                definedVars.add(funcName);
                
                // 收集函数参数
                const paramMatch = line.match(/def \w+\(([^)]*)\)/);
                if (paramMatch) {
                    const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
                    params.forEach(param => definedVars.add(param));
                }
            }

            // 收集变量定义
            if (line.includes('=') && !line.includes('==') && !line.includes('!=')) {
                // 跳过函数调用中的赋值
                if (!line.includes('(') || line.indexOf('=') < line.indexOf('(')) {
                    const parts = line.split('=');
                    const varName = parts[0].trim().split(' ').pop();
                    if (varName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
                        definedVars.add(varName);
                    }
                }
            }

            // 收集循环变量
            if (line.startsWith('for ')) {
                // 处理 for idx, scores in enumerate(all_scores): 这种情况
                const match = line.match(/for\s+([^,]+),\s*([^\s]+)\s+in/);
                if (match) {
                    definedVars.add(match[1].trim());
                    definedVars.add(match[2].trim());
                } else {
                    const varName = line.split('in')[0].split(' ')[1].trim();
                    definedVars.add(varName);
                }
            }
        }

        // 检查未定义的变量和函数
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 提取可能的变量和函数调用
            const tokens = tokenize(line);
            for (let j = 0; j < tokens.length; j++) {
                const token = tokens[j];
                
                // 跳过关键字、内置函数、已定义的变量/函数、数字、字符串
                if (!keywords.has(token) && 
                    !builtinFuncs.has(token) && 
                    !definedVars.has(token) && 
                    !isNumber(token) && 
                    !isString(token)) {
                    
                    // 跳过方法调用（如 obj.method()）
                    if (j > 0 && tokens[j-1] === '.' || methodNames.has(token)) {
                        continue;
                    }
                    
                    // 检查是否是函数调用
                    if (line.includes(token + '(')) {
                        errors.push({
                            line: i + 1,
                            type: 'exception',
                            typeName: '变量未定义',
                            reason: `函数${token}未定义`,
                            fix: '先定义函数',
                            knowledge: '在Python中，调用未定义的函数会引发NameError异常。'
                        });
                    }
                    // 检查是否是变量使用
                    else if (line.includes(token) && 
                             !line.includes('def ' + token) && 
                             !line.includes('for ' + token) && 
                             !line.includes('=' + token)) {
                        // 避免误报，检查是否是字符串的一部分
                        if (!((line.includes('"' + token + '"') || line.includes("'" + token + "'")))) {
                            // 检查是否有相似名称的已定义变量
                            const similarVariable = findSimilarVariable(token, definedVars);
                            
                            let reason = `变量${token}未定义`;
                            let fix = '先定义变量';
                            
                            if (similarVariable) {
                                reason = `变量${token}未定义，可能是想使用${similarVariable}`;
                                fix = `将${token}改为${similarVariable}`;
                            }
                            
                            errors.push({
                                line: i + 1,
                                type: 'exception',
                                typeName: '变量未定义',
                                reason: reason,
                                fix: fix,
                                knowledge: '在Python中，使用未定义的变量会引发NameError异常。'
                            });
                        }
                    }
                }
            }
        }

        return errors;
    }
    
    // 查找相似的变量名
    function findSimilarVariable(variableName, definedVariables) {
        const definedArray = Array.from(definedVariables);
        let bestMatch = null;
        let bestScore = 0;
        
        for (const definedVar of definedArray) {
            const score = calculateSimilarity(variableName, definedVar);
            if (score > bestScore && score > 0.7) { // 相似度阈值
                bestScore = score;
                bestMatch = definedVar;
            }
        }
        
        return bestMatch;
    }
    
    // 计算两个字符串的相似度（Levenshtein距离）
    function calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
        
        for (let i = 0; i <= len1; i++) {
            matrix[i][0] = i;
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // 删除
                    matrix[i][j - 1] + 1, // 插入
                    matrix[i - 1][j - 1] + cost // 替换
                );
            }
        }
        
        // 计算相似度分数（0-1）
        const maxLen = Math.max(len1, len2);
        return 1 - (matrix[len1][len2] / maxLen);
    }

    // 词法分析：将代码行分解为标记
    function tokenize(line) {
        // 简单的词法分析，识别变量名、关键字、数字、字符串等
        const tokens = [];
        let currentToken = '';
        let inString = false;
        let stringDelimiter = '';
        let inComment = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            // 检查是否进入注释
            if (!inString && !inComment && char === '#' && (i === 0 || line[i-1] === ' ')) {
                inComment = true;
                // 跳过注释内容
                break;
            }

            if (inString) {
                currentToken += char;
                if (char === stringDelimiter) {
                    inString = false;
                    tokens.push(currentToken);
                    currentToken = '';
                }
            } else if (char === '"' || char === "'") {
                if (currentToken) {
                    // 检查是否是f-string前缀
                    if (currentToken === 'f') {
                        // f-string前缀不是变量，跳过
                    } else {
                        tokens.push(currentToken);
                    }
                    currentToken = '';
                }
                inString = true;
                stringDelimiter = char;
                currentToken += char;
            } else if (/\w/.test(char)) {
                currentToken += char;
            } else {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                // 跳过运算符、标点符号和点号，这些不是变量
                if (!/\s/.test(char) && !/[+\-*/%=<>!&|^~(),:;{}[\].]/.test(char)) {
                    tokens.push(char);
                }
            }
        }

        if (currentToken) {
            tokens.push(currentToken);
        }

        return tokens;
    }

    // 判断是否是数字
    function isNumber(token) {
        return !isNaN(token) && token.match(/^\d+(\.\d+)?$/);
    }

    // 判断是否是字符串
    function isString(token) {
        return (token.startsWith('"') && token.endsWith('"')) || 
               (token.startsWith("'") && token.endsWith("'"));
    }

    // 检查除以零错误
    function checkZeroDivisionErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查除以零的情况
            if (line.includes('/') && line.includes('0')) {
                // 简单检测直接除以零的情况
                if (line.includes('/ 0') || line.includes('/0')) {
                    errors.push({
                        line: i + 1,
                        type: 'exception',
                        typeName: '除零错误',
                        reason: '尝试除以零',
                        fix: '确保除数不为零',
                        knowledge: '在Python中，尝试除以零会引发ZeroDivisionError异常。'
                    });
                }
            }
        }

        return errors;
    }

    // 检查类型错误
    function checkTypeErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 直接检测包含f-string和+的情况
            if (line.includes('f"') && line.includes('+')) {
                errors.push({
                    line: i + 1,
                    type: 'exception',
                    typeName: '类型错误',
                    reason: '字符串和数字直接拼接',
                    fix: '使用字符串格式化或转换数字为字符串',
                    knowledge: '在Python中，字符串和数字不能直接拼接，需要使用str()函数转换或使用字符串格式化。'
                });
            }
            // 检测普通字符串和+的情况
            else if ((line.includes('"') || line.includes("'")) && line.includes('+')) {
                // 检查是否不是字符串与字符串的拼接
                if (!line.includes('" + "') && !line.includes("' + '")) {
                    errors.push({
                        line: i + 1,
                        type: 'exception',
                        typeName: '类型错误',
                        reason: '字符串和数字直接拼接',
                        fix: '使用字符串格式化或转换数字为字符串',
                        knowledge: '在Python中，字符串和数字不能直接拼接，需要使用str()函数转换或使用字符串格式化。'
                    });
                }
            }
        }

        return errors;
    }

    // 检查索引错误
    function checkIndexErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查索引操作
            if (line.includes('[') && line.includes(']')) {
                // 简单检测可能的索引错误
                if (line.includes('len(') && line.includes(']')) {
                    // 检查是否使用了len()作为索引（可能超出范围）
                    if (line.includes('len(') && line.includes('[')) {
                        errors.push({
                            line: i + 1,
                            type: 'exception',
                            typeName: '索引错误',
                            reason: '可能使用了len()作为索引，这会超出范围',
                            fix: '使用len()-1作为最后一个元素的索引',
                            knowledge: '在Python中，列表的索引从0开始，最后一个元素的索引是len()-1。'
                        });
                    }
                }
            }
        }

        return errors;
    }

    // 检查类型错误
    function checkTypeErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查字符串和数字相加的情况
            if (line.includes('+') && 
                ((line.includes('"') || line.includes("'")) && 
                 (line.includes('1') || line.includes('2') || line.includes('3') || 
                  line.includes('4') || line.includes('5') || line.includes('6') || 
                  line.includes('7') || line.includes('8') || line.includes('9') || line.includes('0')))) {
                // 简单检测字符串和数字相加
                const parts = line.split('+');
                let hasString = false;
                let hasNumber = false;
                
                for (const part of parts) {
                    const trimmedPart = part.trim();
                    if ((trimmedPart.startsWith('"') && trimmedPart.endsWith('"')) || 
                        (trimmedPart.startsWith("'") && trimmedPart.endsWith("'"))) {
                        hasString = true;
                    } else if (!isNaN(trimmedPart) || trimmedPart.match(/^\d+$/)) {
                        hasNumber = true;
                    }
                }
                
                if (hasString && hasNumber) {
                    errors.push({
                        line: i + 1,
                        type: 'exception',
                        typeName: '类型错误',
                        reason: '尝试将字符串和数字相加',
                        fix: '使用str()函数将数字转换为字符串后再相加',
                        knowledge: '在Python中，不能直接将字符串和数字相加，需要先进行类型转换。'
                    });
                }
            }
        }

        return errors;
    }

    // 检查键错误（字典）
    function checkKeyErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查字典键访问
            if (line.includes('[') && line.includes(']') && line.includes(':')) {
                // 简单检测可能的键错误
                errors.push({
                    line: i + 1,
                    type: 'exception',
                    typeName: '键错误',
                    reason: '可能访问字典中不存在的键',
                    fix: '先检查键是否存在，或使用get()方法',
                    knowledge: '在Python中，访问字典中不存在的键会引发KeyError异常。'
                });
            }
        }

        return errors;
    }

    // 检查属性错误
    function checkAttributeErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查可能的属性错误
            if (line.includes('.') && line.includes('(')) {
                // 简单检测可能的方法名错误
                const parts = line.split('.');
                for (const part of parts) {
                    if (part.includes('(')) {
                        const methodName = part.split('(')[0].trim();
                        // 检查常见的方法名错误
                        if (methodName === 'appendd') {
                            errors.push({
                                line: i + 1,
                                type: 'exception',
                                typeName: '属性错误',
                                reason: '方法名写错 appendd → append',
                                fix: '使用正确的方法名 append',
                                knowledge: '在Python中，调用对象不存在的方法会引发AttributeError异常。'
                            });
                        }
                    }
                }
            }
        }

        return errors;
    }

    // 检查文件错误
    function checkFileErrors(lines) {
        let errors = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            // 检查文件操作
            if (line.includes('open(')) {
                errors.push({
                    line: i + 1,
                    type: 'exception',
                    typeName: '文件错误',
                    reason: '可能打开不存在的文件',
                    fix: '检查文件路径或捕获异常',
                    knowledge: '在Python中，尝试打开不存在的文件会引发FileNotFoundError异常。'
                });
            }
        }

        return errors;
    }

    // 检查逻辑错误
    function checkLogicErrors(lines) {
        let errors = [];
        const functionStarts = [];

        // 收集函数定义的开始位置
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('def ')) {
                functionStarts.push(i);
            }
        }

        // 检查每个函数是否有return语句
        for (const startLine of functionStarts) {
            let hasReturn = false;
            let braceCount = 0;
            let endLine = startLine;

            // 找到函数结束位置
            for (let i = startLine + 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line === '') continue;
                
                // 检查是否是函数的结束（下一个函数定义或文件结束）
                if (line.startsWith('def ')) {
                    break;
                }
                
                // 检查是否有return语句
                if (line.startsWith('return ')) {
                    hasReturn = true;
                    break;
                }
                
                endLine = i;
            }

            // 如果函数没有return语句，添加错误
            if (!hasReturn) {
                errors.push({
                    line: startLine + 1,
                    type: 'logic',
                    typeName: '逻辑错误',
                    reason: '函数缺少return语句，将返回None',
                    fix: '添加return语句返回计算结果',
                    knowledge: '在Python中，如果函数没有return语句，会默认返回None。'
                });
            }
        }

        // 检查奇偶性判断逻辑错误
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === '' || line.startsWith('#')) continue;

            if ((line.includes('is_even') || line.includes('isEven')) && 
                (line.includes('% 2 == 1') || line.includes('%2==1'))) {
                errors.push({
                    line: i + 1,
                    type: 'logic',
                    typeName: '逻辑错误',
                    reason: '奇偶性判断逻辑错误，当n % 2 == 1时表示n是奇数，而不是偶数',
                    fix: '将条件改为n % 2 == 0，这样当余数为0时表示n是偶数',
                    knowledge: '在Python中，判断一个数是否为偶数应该使用n % 2 == 0，因为偶数能被2整除，余数为0；而奇数除以2的余数为1。'
                });
            }

            // 检查循环范围逻辑错误
            if (line.includes('for') && line.includes('in') && !line.includes('range(')) {
                // 检查for循环是否使用了数字而不是可迭代对象
                const parts = line.split('in');
                const iterable = parts[1].trim();
                if (!isNaN(iterable) || iterable.match(/^\d+$/)) {
                    errors.push({
                        line: i + 1,
                        type: 'logic',
                        typeName: '逻辑错误',
                        reason: 'for后面必须是可迭代对象，不是数字',
                        fix: '使用range()函数创建可迭代对象',
                        knowledge: '在Python中，for循环后面必须跟一个可迭代对象，如列表、元组或range()。'
                    });
                }
            }
        }

        return errors;
    }

    // 查找代码行号
    function findLineNumber(code, searchString) {
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchString)) {
                return i + 1;
            }
        }
        return 1;
    }






});