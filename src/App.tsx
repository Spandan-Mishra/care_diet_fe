import './App.css';
import './index.css'
import { useRoutes } from "raviger";
import routes from "./routes";

export default function App() {
  const routeResult = useRoutes(routes);
  
  return (
    <div className='diet-container'>
      {routeResult}
    </div>
  );
}
