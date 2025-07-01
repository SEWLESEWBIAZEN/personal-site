import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Projects from "./pages/Projects";
import BlogPost from "./pages/BlogPost"; // New component for individual posts
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Blogs from "./pages/Blogs";
import AdminPanel from "./pages/admin/AdminPanel";

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>         
          <Toaster />
          <Sonner position="top-right" richColors closeButton />          
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route index element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                
                {/* Blog Routes */}
                <Route path="/blog">
                  <Route index element={<Blogs/>} />
                  <Route path=":slug" element={<BlogPost />} />
                </Route>
                
                <Route path="/contact" element={<Contact />} />
                
                {/* Error Handling */}
                <Route path="*" element={<NotFound />} />

                {/* admin panel */}
                <Route path="/en/admin" element={<AdminPanel/>}/>
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;