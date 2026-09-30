import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Box } from '@mui/material';
import { store } from './store/index.ts';
import { AppThemeProvider } from './theme/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { CatalogPage } from './pages/CatalogPage.tsx';
import { BookDetailsPage } from './pages/BookDetailsPage.tsx';
import { PurchasesPage } from './pages/PurchasesPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <BrowserRouter>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: 'background.default',
              color: 'text.primary',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
          >
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/books/:id" element={<BookDetailsPage />} />
                <Route
                  path="/purchases"
                  element={
                    <ProtectedRoute>
                      <PurchasesPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </BrowserRouter>
      </AppThemeProvider>
    </Provider>
  );
}
