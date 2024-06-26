document.addEventListener('DOMContentLoaded', () => {
  const questionForm = document.getElementById('questionForm');
  const questionsDiv = document.getElementById('questions');

  questionForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(questionForm);
    const question = formData.get('question');

    try {
      const response = await fetch('/submit-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (response.ok) {
        loadQuestions();
      }
    } catch (error) {
      console.error('Soru gönderilemedi:', error);
    }
  });

  async function loadQuestions() {
    try {
      const response = await fetch('/get-questions');
      const questions = await response.json();
      questionsDiv.innerHTML = questions.map(q => `
        <div>
          <h2>${q.question}</h2>
          <ul>
            ${q.answers.map(a => `<li>${a.text} - ${a.postedBy}</li>`).join('')}
          </ul>
          <form class="answerForm" data-question-id="${q._id}">
            <input type="text" name="answer" placeholder="Cevabınızı yazın" required>
            <input type="text" name="postedBy" placeholder="İsminiz" required>
            <button type="submit">Cevapla</button>
          </form>
        </div>
      `).join('');

      document.querySelectorAll('.answerForm').forEach(form => {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          const questionId = form.getAttribute('data-question-id');
          const formData = new FormData(form);
          const answer = formData.get('answer');
          const postedBy = formData.get('postedBy');

          try {
            const response = await fetch(`/submit-answer/${questionId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ answer, postedBy })
            });
            if (response.ok) {
              loadQuestions();
            }
          } catch (error) {
            console.error('Cevap gönderilemedi:', error);
          }
        });
      });
    } catch (error) {
      console.error('Sorular alınamadı:', error);
    }
  }

  loadQuestions();
});
