import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});


apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('quiz_master_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('quiz_master_token');
        localStorage.removeItem('quiz_master_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export const authService = {
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },
  logout() {
    localStorage.removeItem('quiz_master_token');
    localStorage.removeItem('quiz_master_user');
  }
};


export const subjectService = {
  getAll() {
    return apiClient.get('/subjects');
  },
  get(id) {
    return apiClient.get(`/subjects/${id}`);
  },
  create(subject) {
    return apiClient.post('/subjects', subject);
  },
  update(id, subject) {
    return apiClient.put(`/subjects/${id}`, subject);
  },
  delete(id) {
    return apiClient.delete(`/subjects/${id}`);
  },
  getChapters(subjectId) {
    return apiClient.get(`/subjects/${subjectId}/chapters`);
  }
};


export const chapterService = {
  getAll(subjectId) {
    return apiClient.get(`/subjects/${subjectId}/chapters`);
  },
  get(id) {
    return apiClient.get(`/chapters/${id}`);
  },
  create(subjectId, chapter) {
    return apiClient.post(`/subjects/${subjectId}/chapters`, chapter);
  },
  update(id, chapter) {
    return apiClient.put(`/chapters/${id}`, chapter);
  },
  delete(id) {
    return apiClient.delete(`/chapters/${id}`);
  },
  getQuizzes(chapterId) {
    return apiClient.get(`/chapters/${chapterId}/quizzes`);
  }
};


export const quizService = {
  getAll(chapterId) {
    return apiClient.get(`/chapters/${chapterId}/quizzes`);
  },
  get(id) {
    return apiClient.get(`/quizzes/${id}`);
  },
  create(chapterId, quiz) {
    return apiClient.post(`/chapters/${chapterId}/quizzes`, quiz);
  },
  update(id, quiz) {
    return apiClient.put(`/quizzes/${id}`, quiz);
  },
  delete(id) {
    return apiClient.delete(`/quizzes/${id}`);
  },
  getQuestions(quizId) {
    return apiClient.get(`/quizzes/${quizId}/questions`);
  },
  startAttempt(quizId) {
    return apiClient.post(`/quizzes/${quizId}/attempt`);
  },
  submitQuiz(quizId, answers) {
    return apiClient.post(`/quizzes/${quizId}/submit`, answers);
  }
};


export const questionService = {
  getAll(quizId) {
    return apiClient.get(`/quizzes/${quizId}/questions`);
  },
  create(quizId, question) {
    return apiClient.post(`/quizzes/${quizId}/questions`, question);
  },
  update(id, question) {
    return apiClient.put(`/questions/${id}`, question);
  },
  delete(id) {
    return apiClient.delete(`/questions/${id}`);
  }
};


export const scoreService = {
  getAll() {
    return apiClient.get('/scores');
  },
  get(id) {
    return apiClient.get(`/scores/${id}`);
  },
  exportCsv() {
    return apiClient.post('/scores/export');
  },
  checkExportStatus(taskId) {
    return apiClient.get(`/scores/export/${taskId}`);
  }
};



export const dashboardService = {
  getStats() {
    return apiClient.get('/dashboard/stats');
  }
};

export default {
  auth: authService,
  subjects: subjectService,
  chapters: chapterService,
  quizzes: quizService,
  questions: questionService,
  scores: scoreService,
  dashboard: dashboardService
}; 