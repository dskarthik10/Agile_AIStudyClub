import { mockQuizzes } from '../data/mockQuizzes';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const quizService = {
  // Get all quizzes with optional filters
  async getQuizzes(filters = {}) {
    await delay();
    let quizzes = [...mockQuizzes];

    if (filters.subject && filters.subject !== 'All Subjects') {
      quizzes = quizzes.filter(q => q.subject === filters.subject);
    }

    if (filters.difficulty && filters.difficulty !== 'All Difficulties') {
      quizzes = quizzes.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      quizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.subject.toLowerCase().includes(searchLower)
      );
    }

    return quizzes;
  },

  // Get a single quiz by ID
  async getQuizById(id) {
    await delay();
    const quiz = mockQuizzes.find(q => q.id === id);
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    return quiz;
  },

  // Submit quiz answers and calculate score
  async submitQuiz(quizId, answers) {
    await delay(500);
    const quiz = mockQuizzes.find(q => q.id === quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let correctCount = 0;
    const results = quiz.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer: answers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        options: question.options,
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    return {
      quizId,
      quizTitle: quiz.title,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: quiz.questions.length - correctCount,
      score,
      percentage: score,
      results,
    };
  },

  // Search quizzes
  async searchQuizzes(query) {
    await delay();
    const lowerQuery = query.toLowerCase();
    return mockQuizzes.filter(q =>
      q.title.toLowerCase().includes(lowerQuery) ||
      q.description.toLowerCase().includes(lowerQuery) ||
      q.subject.toLowerCase().includes(lowerQuery)
    );
  },
};
