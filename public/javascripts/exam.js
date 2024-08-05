
document.addEventListener('DOMContentLoaded', async () => {
    await fetchTestData();

    function toggleAsideClass() {
        const aside = document.querySelector('aside');
        if (window.innerWidth < 750) {
            aside.classList.add('collapsed');
        } else {
            aside.classList.remove('collapsed');
        }
    }
    toggleAsideClass();
    window.addEventListener('resize', toggleAsideClass);
    initializeTest();
});


const fetchTestData = async () => {
    try {
        const urlParts = window.location.pathname.split('/');
        const testId = urlParts[urlParts.length - 1]; // Get the last part of the URL

        // Get the ID from the URL
        const testAttemptData = JSON.parse(localStorage.getItem('test_attempt')) || null;
        if (testAttemptData && testAttemptData.test_id == testId) {
            return;
        }
        // console.log(testAttemptData.test_id, testId)

        // Make the fetch call
        const response = await fetch(`/api/test/${testId}/data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response, "resp ")
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();

        // Store the response in localStorage
        localStorage.setItem('test_attempt', JSON.stringify(data));

    } catch (error) {
        console.error('Error:', error);
    }
};


const initializeTest = () => {
    // Retrieve the test_attempt data from localStorage
    const testAttemptData = JSON.parse(localStorage.getItem('test_attempt'));
    let currentQuestionIndex = testAttemptData.current_question_position;
    // testAttemptData.current_question_position

    if (testAttemptData && testAttemptData.test_sections && testAttemptData.test_sections[0].questions) {
        const questions = testAttemptData.test_sections[0].questions;
        const totalQuestions = questions.length;

        const questionTextElement = document.querySelector('.question-text');
        const optionsContainer = document.querySelector('.options-container');
        const numbersGridElement = document.querySelector('.numbers-grid');
        const title = document.querySelector('.title');
        title.innerHTML = testAttemptData.title

        // Function to render the current question and its options
        function renderQuestion() {
            const question = questions[currentQuestionIndex];
            questionTextElement.innerHTML = `${question.question_number}. ${question.question}`;
            document.querySelector(`button[question-num="${currentQuestionIndex + 1}"]`).classList.add('current_question');
            // Clear previous options
            optionsContainer.innerHTML = '';

            // Create and append the options
            question.options.forEach(option => {
                const optionLabel = document.createElement('label');
                optionLabel.className = 'option';
                option.selected ? optionLabel.classList.add('checked') : '';
                optionLabel.innerHTML = `
                <input type="radio" name="answer" value="${option.option_number}" class="hidden" ${option.selected ? 'checked' : ''} />
                ${option.option_number}. <div>${option.option}</div>
                `;
                optionsContainer.appendChild(optionLabel);
            });

            updateLocalStorageTime();
            updateOptionStyles();
            if (testAttemptData.is_test_ended) {
                test_ended();
                return;
            }
        }


        // Function to update the question numbers
        function updateQuestionNumbers() {
            // countDataElement.innerHTML = `Attempted: <span class="attempted-count">${questions.filter(q => q.answer).length}</span>, Total: ${totalQuestions}`;
            document.querySelector('.review_num').innerHTML = questions.filter(q => q.state == "3" && q.answered == false).length;
            document.querySelector('.attempted_num').innerHTML = questions.filter(q => q.state == "2" && q.answered == true).length;
            document.querySelector('.unattempted_num').innerHTML = questions.filter(q => q.state == "1" && q.visited == true).length;
            document.querySelector('.not_visited_num').innerHTML = questions.filter(q => q.visited == false).length;
            document.querySelector('.attempted_review_num').innerHTML = questions.filter(q => q.state == "3" && q.answered == true).length;

            numbersGridElement.innerHTML = '';
            questions.forEach((q, index) => {
                const numberButton = document.createElement('button');
                numberButton.className = 'number-button';
                numberButton.textContent = index + 1;
                numberButton.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="star"
                                class="svg-inline--fa fa-star " role="img" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512">
                                <path fill="currentColor"
                                    d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z">
                                </path>
                            </svg> ${index + 1}`;

                numberButton.setAttribute('question-num', index + 1);


                // Set additional classes based on the question state
                if (q.state == "3" && q.answered == false) {
                    numberButton.className = 'reviewed_question';
                } else if (q.state == "2" && q.answered == true) {
                    numberButton.className = 'attempted_question';
                } else if (q.state == "1" && q.visited == true) {
                    numberButton.className = 'unattempted_question';
                } else if (q.state == "3" && q.answered == true) {
                    numberButton.className = 'attempted_reviewed_question';
                }
                numberButton.classList.add('number-button');

                numberButton.addEventListener('click', () => {
                    currentQuestionIndex = index;

                    // Clear previous current class from all buttons
                    document.querySelectorAll('.number-button').forEach(btn => btn.classList.remove('current_question'));
                    numberButton.classList.add('current_question'); // Mark the current question button
                    testAttemptData.current_question_position = currentQuestionIndex;
                    renderQuestion();
                });
                numbersGridElement.appendChild(numberButton);
            });
        }

        // Function to save the current answer and state
        function saveCurrentAnswer(state) {
            clearResponse()
            const selectedOption = document.querySelector('input[name="answer"]:checked');
            if (selectedOption) {
                const selectedValue = selectedOption.value;
                questions[currentQuestionIndex].options[selectedValue - 1].selected = true;
                questions[currentQuestionIndex].state = state;
                questions[currentQuestionIndex].answered = true;
                questions[currentQuestionIndex].visited = true;
            } else {
                questions[currentQuestionIndex].state = state == 2 ? 1 : state; // Unattempted
                questions[currentQuestionIndex].visited = true;
            }
            testAttemptData.current_question_position = currentQuestionIndex;

            updateLocalStorageTime();
            updateQuestionNumbers();
            updateOptionStyles();
        }

        function clearResponse() {
            const currentQuestion = questions[currentQuestionIndex];
            currentQuestion.options.forEach(option => {
                option.selected = false;
            });
            currentQuestion.answered = false;
            currentQuestion.state = "1";
            currentQuestion.visited = true;

            updateLocalStorageTime();
        }

        // Event listeners
        document.querySelector('.save-next').addEventListener('click', () => {
            saveCurrentAnswer("2"); // Set state to "2" for attempted
            if (currentQuestionIndex < totalQuestions - 1) {
                currentQuestionIndex++;
                renderQuestion();
            }
        });

        document.querySelector('.review-next').addEventListener('click', () => {
            saveCurrentAnswer("3"); // Set state to "3" for review
            if (currentQuestionIndex < totalQuestions - 1) {
                currentQuestionIndex++;
                renderQuestion();
            }
        });

        document.querySelector('.previous-question').addEventListener('click', () => {
            saveCurrentAnswer(questions[currentQuestionIndex].state); // Save current state
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderQuestion();
            }
        });


        document.querySelector('.clear-response').addEventListener('click', () => {
            clearResponse();
            const options = document.querySelectorAll('input[name="answer"]');
            options.forEach(option => {
                if (option.checked) { 
                    option.checked = false; // Clear the selection
                    const label = document.querySelector(`label[class="option checked"]`);
                    if (label) {
                        label.classList.remove("checked");
                    }
                }
            });
            updateQuestionNumbers();
        });

        function updateOptionStyles() {
            const options_html = document.querySelectorAll('.option');
            options_html.forEach(option => {
                const radioButton = option.querySelector('input[type="radio"]');

                if (radioButton.checked) {
                    option.classList.add('checked');
                } else {
                    option.classList.remove('checked');
                }

                option.addEventListener('click', () => {
                    options_html.forEach(e => {
                        e.querySelector('input[type="radio"]').checked = false;
                        e.classList.remove('checked');
                    });
                    radioButton.checked = true;
                    option.classList.add('checked');
                    updateLocalStorageTime();
                });
            });
            updateLocalStorageTime();
        }

        // Timer
        let timeInSeconds = testAttemptData.time_remaining;
        function timer() {
            const timerElement = document.querySelector('.timer');

            function updateTimer() {
                const hours = Math.floor(timeInSeconds / 3600);
                const minutes = Math.floor((timeInSeconds % 3600) / 60);
                const seconds = timeInSeconds % 60;
                timerElement.innerHTML = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                if(!testAttemptData.is_test_ended){
                    timeInSeconds--;
                }
                if (timeInSeconds < 0) {
                    clearInterval(timerInterval);
                    timerElement.innerHTML = '00:00:00';
                    test_ended()
                }
            }
            const timerInterval = setInterval(updateTimer, 1000);
        }
        function updateLocalStorageTime() {
            testAttemptData.time_remaining = timeInSeconds;
            testAttemptData.current_question_position = currentQuestionIndex;
            localStorage.setItem('test_attempt', JSON.stringify(testAttemptData));
        }
        const localStorageInterval = setInterval(updateLocalStorageTime, 10000);

        // Initialize the UI
        updateQuestionNumbers();
        renderQuestion();
        updateOptionStyles();
        timer();

        document.querySelector('.btn_submit').addEventListener('click', () => {
            test_ended()
        })
        document.querySelector('.btn_submit_2').addEventListener('click', () => {
            test_ended()
        })

        async function test_ended() {
            testAttemptData.is_test_ended = true;
            updateLocalStorageTime();
            document.querySelector('.modal').style.display = "flex";

            try {
                const urlParts = window.location.pathname.split('/');
                const testId = urlParts[urlParts.length - 1];



            } catch (error) {
                console.error('Error:', error);
            }
        }

        document.getElementById('viewResult').addEventListener('click', async function () {
            const urlParts = window.location.pathname.split('/');
            const testId = urlParts[urlParts.length - 1];

            const testAttemptData = JSON.parse(localStorage.getItem('test_attempt'));
            const response = await fetch(`/api/test/${testId}/data/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ testAttemptData })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            const data = await response.json();

            if (data.status == 'success') {
                window.location.href = `/test/${testId}/result`;
            } else {
                alert("Something Went Wrong")
            }

        });

    } else {
        console.error('No test_attempt data found in localStorage.');
    }
}


