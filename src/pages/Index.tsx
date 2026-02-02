import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to missions page as the main dashboard view
  return <Navigate to="/missions" replace />;
};

export default Index;
