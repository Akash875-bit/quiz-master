import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'


import Layout from '../layouts/Layout.vue'


import Landing from '../views/Landing.vue'


import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'


import UserDashboard from '../views/user/Dashboard.vue'
import UserSubjects from '../views/user/Subjects.vue'
import UserQuizzes from '../views/user/Quizzes.vue'
import TakeQuiz from '../views/user/TakeQuiz.vue'
import UserResults from '../views/user/Results.vue'


import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminSubjects from '../views/admin/Subjects.vue'
import AdminChapters from '../views/admin/Chapters.vue'
import AdminQuizzes from '../views/admin/Quizzes.vue'
import AdminQuestions from '../views/admin/Questions.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminReports from '../views/admin/Reports.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'landing',
        component: Landing,
        meta: { title: 'Welcome to Quiz Master' }
      },
      // auth routes
      {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { title: 'Login', guest: true }
      },
      {
        path: 'register',
        name: 'register',
        component: Register,
        meta: { title: 'Register', guest: true }
      },
      
      // user ke routes
      {
        path: 'dashboard',
        name: 'user.dashboard',
        component: UserDashboard,
        meta: { requiresAuth: true, title: 'Dashboard' }
      },
      {
        path: 'subjects',
        name: 'user.subjects',
        component: UserSubjects,
        meta: { requiresAuth: true, title: 'Subjects' }
      },
      {
        path: 'subjects/:subjectId/quizzes',
        name: 'user.quizzes',
        component: UserQuizzes,
        meta: { requiresAuth: true, title: 'Quizzes' }
      },
      {
        path: 'quiz/:quizId',
        name: 'user.takeQuiz',
        component: TakeQuiz,
        meta: { requiresAuth: true, title: 'Take Quiz' }
      },
      {
        path: 'results',
        name: 'user.results',
        component: UserResults,
        meta: { requiresAuth: true, title: 'My Results' }
      },
      
      
      // admin ke routes
      {
        path: 'admin/dashboard',
        name: 'admin.dashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, isAdmin: true, title: 'Admin Dashboard' }
      },
      {
        path: 'admin/subjects',
        name: 'admin.subjects',
        component: AdminSubjects,
        meta: { requiresAuth: true, isAdmin: true, title: 'Manage Subjects' }
      },
      {
        path: 'admin/subjects/:subjectId/chapters',
        name: 'admin.chapters',
        component: AdminChapters,
        meta: { requiresAuth: true, isAdmin: true, title: 'Manage Chapters' }
      },
      {
        path: 'admin/chapters/:chapterId/quizzes',
        name: 'admin.quizzes',
        component: AdminQuizzes,
        meta: { requiresAuth: true, isAdmin: true, title: 'Manage Quizzes' }
      },
      {
        path: 'admin/quizzes/:quizId/questions',
        name: 'admin.questions',
        component: AdminQuestions,
        meta: { requiresAuth: true, isAdmin: true, title: 'Manage Questions' }
      },
      {
        path: 'admin/users',
        name: 'admin.users',
        component: AdminUsers,
        meta: { requiresAuth: true, isAdmin: true, title: 'Manage Users' }
      },
      {
        path: 'admin/reports',
        name: 'admin.reports',
        component: AdminReports,
        meta: { requiresAuth: true, isAdmin: true, title: 'Reports' }
      }
    ]
  },

  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})


router.beforeEach((to, from, next) => {

  document.title = to.meta.title ? `${to.meta.title} | Quiz Master` : 'Quiz Master'
  
  const isLoggedIn = store.getters.isAuthenticated
  const isAdmin = store.getters.isAdmin
  

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    

    if (to.matched.some(record => record.meta.isAdmin) && !isAdmin) {
      next({ name: 'user.dashboard' })
      return
    }
  }
  
  if (to.matched.some(record => record.meta.guest) && isLoggedIn) {
    next({ name: isAdmin ? 'admin.dashboard' : 'user.dashboard' })
    return
  }
  
  next()
})

export default router 