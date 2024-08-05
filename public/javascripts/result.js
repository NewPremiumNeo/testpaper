let Correct = [];
let Incorrect = [];
let Unattempted = [];
let positiveMarks = 0;
let negativeMarks = 0;
let testAttemptData = ''


const fetchTestResultData = async () => {
    try {
        const urlParts = window.location.pathname.split('/');
        const testId = urlParts[urlParts.length - 2];

        const testAttemptData = JSON.parse(localStorage.getItem('result')) || null;
        if (testAttemptData && testAttemptData.test_id == testId) {
            return;
        }

        // Make the fetch call
        const response = await fetch(`/api/test/${testId}/result`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        const testAttemptDataJson = JSON.parse(data.testAttemptData);
        if (data && data.testAttemptData) {
            localStorage.setItem('result', JSON.stringify(testAttemptDataJson));
        } else {
            alert("Result Not Found!! @@@@@@")
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error:', error);
    }
};



document.addEventListener('DOMContentLoaded', async () => {

    await fetchTestResultData();

    testAttemptData = JSON.parse(localStorage.getItem('result'));
    if (!testAttemptData) {
        alert("Result Not Found!!")
    }

    toggleAsideClass();
    window.addEventListener('resize', toggleAsideClass);

    initializeTest();
    renderHome();
});

const initializeTest = async () => {
    const numbersGridElement = document.querySelector('.numbers-grid');
    const mainQuestionContainer = document.querySelector('.question');

    const questions = testAttemptData.test_sections[0].questions;

    questions.forEach((q, index) => {
        if (q.answered == true) {
            if (q.options[q.answer - 1].selected == true) {
                Correct.push(q)
                positiveMarks += Math.abs(Number(q.positive_marks));
            }
            else {
                Incorrect.push(q)
                negativeMarks += Math.abs(Number(q.negative_marks));
            }
        }
        else {
            Unattempted.push(q)
        }

    });

    function renderQuestion(currentQuestionIndex) {
        const question = questions[currentQuestionIndex];
        let optionssss = ''
        question.options.forEach(option => {
            const lable = `<label class="option ${option.selected ? (option.option_number == question.answer ? 'correct_answer' : 'incorrect_answer') : (option.option_number == question.answer ? 'correct_answer' : '')}">
                        ${option.option_number}. <div>${option.option}</div>
                        </label>`
            optionssss += lable
        });
        const mainText = `
                <p class="question-text">${question.question_number}. ${question.question}</p>
                <div class="options-container">
                ${optionssss}
                </div>
    `;
        mainQuestionContainer.innerHTML = mainText

        // updateOptionStyles();
    }

    function updateQuestionNumbers() {
        numbersGridElement.innerHTML = '';
        document.querySelector('.correct_num').textContent = Correct.length;
        document.querySelector('.incorrect_num').textContent = Incorrect.length;
        document.querySelector('.unattempted_num').textContent = Unattempted.length;
        questions.forEach((q, index) => {
            const numberButton = document.createElement('button');
            numberButton.className = 'number-button';
            numberButton.textContent = index + 1;

            numberButton.setAttribute('question-num', index + 1);


            // Set additional classes based on the question state
            if (Correct.includes(q)) {
                numberButton.className = 'correct_question';
            } else if (Incorrect.includes(q)) {
                numberButton.className = 'incorrect_question';
            } else if (Unattempted.includes(q)) {
                numberButton.className = 'unattempted_question';
            }
            numberButton.classList.add('number-button');

            numberButton.addEventListener('click', () => {
                renderQuestion(index);
            });
            numbersGridElement.appendChild(numberButton);
        });
    }
    updateQuestionNumbers()

};


function renderHome() {
    const title = testAttemptData.title
    const mainQuestionContainer = document.querySelector('.question');
    const initaialText = `
        <div class="status">
            <span>
                <span class="svgCover score big">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trophy"
                        class="svg-inline--fa fa-trophy  position-absolute center text-white" role="img"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path fill="currentColor"
                            d="M400 0L176 0c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8L24 64C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9L192 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-26.1 0C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24L446.4 64c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112l84.4 0c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6l84.4 0c-5.1 66.3-31.1 111.2-63 142.3z">
                        </path>
                    </svg></span> Your Score:  <span class="resultValue">${positiveMarks - negativeMarks}/${testAttemptData.marks}</span>
            </span>
            <span>
                <span class="svgCover correct_question big">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check"
                        class="svg-inline--fa fa-check  position-absolute center text-white" role="img"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor"
                            d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z">
                        </path>
                    </svg> </span>
                Correct: <span class="resultValue">${Correct.length}</span>
            </span>

            <span>
                <span class="svgCover incorrect_question big">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="xmark"
                        class="svg-inline--fa fa-xmark  position-absolute center text-white" role="img"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path fill="currentColor"
                            d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z">
                        </path>
                    </svg>
                </span>
                Incorrect: <span class="resultValue">${Incorrect.length}</span>
            </span>
            <span>
                <span class="svgCover unattempted_question big">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="minus"
                        class="svg-inline--fa fa-minus  position-absolute center text-white" role="img"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path fill="currentColor"
                            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z">
                        </path>
                    </svg>
                </span> Not Attempted: <span class="resultValue">${Unattempted.length}</span>
            </span>
            <span>
                <span class="svgCover big accuracy">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-dot"
                        class="svg-inline--fa fa-circle-dot fa-lg position-absolute center text-white" role="img"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path fill="currentColor"
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-352a96 96 0 1 1 0 192 96 96 0 1 1 0-192z">
                        </path>
                    </svg>
                </span> Accuracy: <span class="resultValue">${Correct.length / testAttemptData.questions * 100}%</span>
            </span>
        </div>

`

    mainQuestionContainer.innerHTML = initaialText
    document.querySelector('.title').textContent = title;

}


function toggleAsideClass() {
    const aside = document.querySelector('aside');
    if (window.innerWidth < 750) {
        aside.classList.add('collapsed');
    } else {
        aside.classList.remove('collapsed');
    }
}