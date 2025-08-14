// src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import TopBar from "./ui/TopBar";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <>
      <TopBar />
      <Container className="mt-3">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path=":id" element={<ProfilePage />} />
        </Routes>
      </Container>
    </>
  );
}