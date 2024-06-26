// server.js

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;

// MongoDB'ye bağlanma
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB bağlantı hatası:'));
db.once('open', () => {
  console.log('MongoDB bağlantısı başarılı.');
});

// Mongoose model tanımı
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answers: [
    {
      text: { type: String, required: true },
      postedBy: { type: String, required: true },
    }
  ],
});

const Question = mongoose.model('Question', questionSchema);

// Express middleware'leri
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ana sayfa için HTML dosyasını sunma
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST isteği - Soru gönderme
app.post('/submit-question', async (req, res) => {
  const questionText = req.body.question;
  try {
    const newQuestion = new Question({ question: questionText, answers: [] });
    await newQuestion.save();
    res.status(200).send('Soru başarıyla gönderildi.');
  } catch (error) {
    res.status(500).send(`Sunucu hatası: ${error.message}`);
  }
});

// GET isteği - Tüm soruları alma
app.get('/get-questions', async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    res.status(500).send(`Sunucu hatası: ${error.message}`);
  }
});

// POST isteği - Cevap gönderme
app.post('/submit-answer/:questionId', async (req, res) => {
  const questionId = req.params.questionId;
  const { answer, postedBy } = req.body;

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      res.status(404).send('Soru bulunamadı.');
      return;
    }

    question.answers.push({ text: answer, postedBy: postedBy });
    await question.save();

    res.status(200).send('Cevap başarıyla gönderildi.');
  } catch (error) {
    res.status(500).send(`Sunucu hatası: ${error.message}`);
  }
});

// Statik dosyaları sunma
app.use(express.static(path.join(__dirname, 'public')));

// Express uygulamasını dinlemeye başlama
app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
