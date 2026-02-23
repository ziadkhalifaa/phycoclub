import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Articles from "./pages/Articles";
import Sessions from "./pages/Sessions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import CourseDetail from "./pages/CourseDetail";
import Lesson from "./pages/Lesson";
import ArticleDetail from "./pages/ArticleDetail";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";


export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/courses", element: <Courses /> },
  { path: "/courses/:courseId", element: <CourseDetail /> },
  { path: "/courses/:courseId/lesson/:lessonId", element: <Lesson /> },
  { path: "/articles", element: <Articles /> },
  { path: "/articles/:articleId", element: <ArticleDetail /> },
  { path: "/sessions", element: <Sessions /> },
  { path: "/about", element: <About /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/admin", element: <Admin /> },
  { path: "*", element: <NotFound /> },

]);
