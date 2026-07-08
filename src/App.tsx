/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Todo } from './pages/Productivity';
import { Journal } from './pages/Journal';
import { Experiments } from './pages/Experiments';
import { Skills } from './pages/Skills';
import { Timeline } from './pages/Timeline';
import { About } from './pages/About';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="experiments" element={<Experiments />} />
              <Route path="journal" element={<Journal />} />
              <Route path="todo" element={<Todo />} />
              <Route path="skills" element={<Skills />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="about" element={<About />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
