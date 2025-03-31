

import ExampleManager from '../components/QuestionQueryExample';
import { useMsal } from '@azure/msal-react'; // Assuming you're using MSAL React



const QuestionQueryExamplePage: React.FC = () => {
    const { instance: msalInstance } = useMsal(); // Get the msalInstance

  
    return (
        <div style={{ height: '88vh', overflow: 'hidden' }}>
          <ExampleManager msalInstance={msalInstance} />
       
      </div>
    );
};

export default QuestionQueryExamplePage;
