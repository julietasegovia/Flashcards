let flashcards = [
    { question: "20 + 20 + 20 + 7 = ?", answer:"67" }
];

let currentIndex = 0;
let isAnimating = false;
let flippedState = [];

//rendering
function renderCards(){
    const track = document.querySelector(".carousel-track");
    const dotsContainer = document.querySelector(".dots");

    if (!track || !dotsContainer) return;
    
    track.innerHTML = "";
    dotsContainer.innerHTML = "";
    flippedState = new Array(flashcards.length).fill(false);

    flashcards.forEach((fc, i) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.index = i;
        card.innerHTML = `
            <h1 class="question">${escapeHtml(fc.question)}</h1>
            <h1 class="answer hidden">${escapeHtml(fc.answer)}</h1>
            <button class="edit-btn" data-index="${i}">✎</button>
            <button class="delete-btn" data-index="${i}">×</button>
        `;
        track.appendChild(card);

        const dot = document.createElement("div");
        dot.classList.add("dot");
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    });

    bindCardEvents();
    bindDotEvents();
    updateCarousel(0);
}

//this is just to prevent xss
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

//moving around
function bindCardEvents(){
    const cards = document.querySelectorAll(".card");

    cards.forEach((card, i) => {
        
        const editBtn = card.querySelector(".edit-btn");
        const deleteBtn = card.querySelector(".delete-btn");

        if (editBtn) {
            editBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                openEditModal(i);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteCard(i);
            });
        }

        card.addEventListener("click", () => {
            if(isAnimating) return;

            const question = card.querySelector(".question");
            const answer = card.querySelector(".answer");

            if (!question || !answer) return;

            question.classList.add("hidden");
            answer.classList.add("hidden");
            card.classList.add("flipping");

            setTimeout(() => {
                flippedState[i] = !flippedState[i];
                if(flippedState[i]){
                    answer.classList.remove("hidden");
                }else{
                    question.classList.remove("hidden");
                }
                card.classList.remove("flipping");
            }, 400);
        });
        
    });
}

function bindDotEvents() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => updateCarousel(i));
    });
}

//carousel logic
function updateCarousel(newIndex) {
    if(isAnimating) return;
    isAnimating = true;

    const cards = document.querySelectorAll(".card");
    const dots = document.querySelectorAll(".dot");

    if (cards.length === 0) {
        isAnimating = false;
        return;
    }

    currentIndex = (newIndex + cards.length) % cards.length;

    cards.forEach((card, i) => {
        const offset = (i - currentIndex + cards.length) % cards.length;
        card.classList.remove("center", "up-1", "up-2", "down-1", "down-2", "hidden");

        if (offset === 0)                       card.classList.add("center");
        else if (offset === 1)                  card.classList.add("down-1");
        else if (offset === 2)                  card.classList.add("down-2");
        else if (offset === cards.length - 1)   card.classList.add("up-1");
        else if (offset === cards.length - 2)   card.classList.add("up-2");
        else                                    card.classList.add("hidden");
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
    });

    setTimeout(() => {
        isAnimating = false;
    }, 400);
}

//user adds a card
function openModal() {
    const modal = document.getElementById("card-modal");
    if (modal) modal.classList.remove("hidden");
}

function closeModal() {
    const modal = document.getElementById("card-modal");
    if (modal) modal.classList.add("hidden");
    const questionInput = document.getElementById("input-question");
    const answerInput = document.getElementById("input-answer");
    if (questionInput) questionInput.value = "";
    if (answerInput) answerInput.value = "";
}

function saveCard() {
    const question = document.getElementById("input-question").value.trim();
    const answer = document.getElementById("input-answer").value.trim();
    
    if(!question || !answer) return;

    flashcards.push({question: question, answer: answer});
    closeModal();
    renderCards();
    updateCarousel(flashcards.length - 1);
}

//user deletes card function
function deleteCard(index) {
    if (confirm("Delete this flashcard?")) {
        flashcards.splice(index, 1);
        if (flashcards.length === 0) {
            flashcards.push({ question: "No cards left", answer: "Add a new card!" });
        }
        if (currentIndex >= flashcards.length) {
            currentIndex = flashcards.length - 1;
        }
        renderCards();
        updateCarousel(currentIndex);
    }
}

//user edits a card
function openEditModal(index) {
    const modal = document.getElementById("edit-modal");
    if (!modal) return;
    
    modal.classList.remove("hidden");
    const editQuestion = document.getElementById("edit-question");
    const editAnswer = document.getElementById("edit-answer");
    
    if (editQuestion) editQuestion.value = flashcards[index].question;
    if (editAnswer) editAnswer.value = flashcards[index].answer;
    modal.dataset.index = index;
}

function closeEditModal() {
    const modal = document.getElementById("edit-modal");
    if (modal) modal.classList.add("hidden");
}

function saveEdit() {
    const modal = document.getElementById("edit-modal");
    if (!modal) return;
    
    const index = parseInt(modal.dataset.index);
    const question = document.getElementById("edit-question").value.trim();
    const answer = document.getElementById("edit-answer").value.trim();
    
    if(!question || !answer) return;

    flashcards[index] = {question: question, answer: answer};
    closeEditModal();
    renderCards();
    updateCarousel(index);
}

//listeners
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("add-card-btn");
    if (addBtn) addBtn.addEventListener("click", openModal);
    
    const upArrow = document.querySelector(".nav-arrow.up");
    const downArrow = document.querySelector(".nav-arrow.down");
    
    if (upArrow) {
        upArrow.addEventListener("click", () => {
            updateCarousel(currentIndex - 1);
        });
    }
    
    if (downArrow) {
        downArrow.addEventListener("click", () => {
            updateCarousel(currentIndex + 1);
        });
    }
    
    const modalSave = document.getElementById("modal-save");
    const modalCancel = document.getElementById("modal-cancel");
    const editSave = document.getElementById("edit-modal-save");
    const editCancel = document.getElementById("edit-modal-cancel");
    
    if (modalSave) modalSave.addEventListener("click", saveCard);
    if (modalCancel) modalCancel.addEventListener("click", closeModal);
    if (editSave) editSave.addEventListener("click", saveEdit);
    if (editCancel) editCancel.addEventListener("click", closeEditModal);
});

//scroll through cards with arrow keys
document.addEventListener("keydown", (e) => {
    if(e.key === "ArrowUp") updateCarousel(currentIndex - 1);
    if(e.key === "ArrowDown") updateCarousel(currentIndex + 1);
    if(e.key === "Escape") {
        closeModal();
        closeEditModal();
    }
});

//scroll through cards with mouse scroll
document.addEventListener("wheel", (e) => {
    if (e.deltaY > 0) {
        updateCarousel(currentIndex + 1);
    } else if (e.deltaY < 0) {
        updateCarousel(currentIndex - 1);
    }
});

let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", (e) => {
    const diff = touchStartY - e.changedTouches[0].screenY;
    if(Math.abs(diff) > 50){
        updateCarousel(diff > 0 ? currentIndex + 1 : currentIndex - 1);
    }
});

//initiate program
renderCards();