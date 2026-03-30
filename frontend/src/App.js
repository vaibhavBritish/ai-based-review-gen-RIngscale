import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import HomePage from "./pages/HomePage";
import ClientLandingPage from "./pages/ClientLandingPage";

function App() {
  return (
    <div className="App">
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:clientSlug" element={<ClientLandingPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
