import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './Welcome.jsx';
import Results from './Results.jsx';
import Test from './test.jsx';
import InterviewNew from './InterviewNew.jsx';
import FeedbackPage from './Feedback.jsx';
import ResumeChecker from './components/ResumeChecker.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/interview" element={<InterviewNew />} />
        <Route path="/resume-checker" element={<ResumeChecker />} />
        <Route path="/test" element={<Test />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;