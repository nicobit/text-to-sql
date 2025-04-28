

import ExampleManager from '../components/QuestionQueryExample';
import ContentTitle from '../components/ContentTitle';
import { useMsal } from '@azure/msal-react'; // Assuming you're using MSAL React


const QuestionQueryExamplePage: React.FC = () => {
    const { instance: msalInstance } = useMsal(); // Get the msalInstance

  
    return (
         <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Environment Status</h2>
             
              <ExampleManager msalInstance={msalInstance} />
             
            </div>
        
       
    
    );
};

export default QuestionQueryExamplePage;
