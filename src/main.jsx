import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";  
import InstagramDownloader from './components/InstagramDownloader.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <InstagramDownloader/>,
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
