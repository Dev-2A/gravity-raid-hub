import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Toto from "./pages/Toto";
import Awards from "./pages/Awards";
import History from "./pages/History";
import HallOfFame from "./pages/HallOfFame";
import Profile from "./pages/Profile";
import Timeline from "./pages/Timeline";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="toto" element={<Toto />} />
          <Route path="awards" element={<Awards />} />
          <Route path="hall" element={<HallOfFame />} />
          <Route path="profile" element={<Profile />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
