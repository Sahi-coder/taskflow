import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Board from "../components/board/Board";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Hero />
      <Board />
    </div>
  );
}

export default Home;