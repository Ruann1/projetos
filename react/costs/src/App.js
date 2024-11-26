import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/pages/Home';
import Empresa from './components/pages/Empresa';
import Contato from './components/pages/Contato';
import NovoProjeto from './components/pages/novoProjeto';
import Projects from './components/pages/Projects';
import Project from './components/pages/Project'

import Container from './components/layout/Container'


import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'



function App() {
  return (
    <BrowserRouter>
    <Navbar />

    <Container customClass='min-height'>
      
      <Routes>
        <Route path='/' element = {<Home />} />
        <Route path='/Projects' element = {<Projects />} />
        <Route path='/Empresa' element = {<Empresa />} />
        <Route path='/Contato' element = {<Contato />} />
        <Route path='/novoProjeto' element = {<NovoProjeto />} />
        <Route path='/project/:id' element = {<Project />} />
      </Routes>
      
    </Container>
    <Footer />
    </BrowserRouter>
  );
}

export default App;
