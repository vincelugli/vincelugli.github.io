// Define the shape of our theme object for TypeScript
export interface Theme {
  body: string;
  text: string;
  background: string;
  backgroundTwo: string;
  backgroundThree: string, 
  borderColor: string;
  primary: string;
  primaryHover: string;
  boxShadow: string;
  buttonHoverBg: string;
  textAlt: string;     // For secondary/grey text
  success: string;     // For green text (wins, success messages)
  danger: string;      // For red text (losses, error messages)

  scrollbar: string;
  border: string;
  borderBottom: string;

  matchCard: string;
  code: string;
}

// Define the colors for the light theme
export const lightTheme: Theme = {
  body: '#F0F2F5',
  text: '#333333',
  background: '#FFFFFF',
  backgroundTwo: '#f8f9fa',
  backgroundThree: '#e9ecef', 
  borderColor: '#DDDDDD',
  primary: '#007BFF',
  primaryHover: '#0056b3',
  boxShadow: 'rgba(0, 0, 0, 0.1)',
  buttonHoverBg: '#0056b3',
  textAlt: '#6c757d',
  success: '#28a745',
  danger: '#dc3545',

  scrollbar: '#f1f1f1', 
  border: '#dee2e6',
  borderBottom: '#f0f0f0',

  matchCard: 'rgba(0, 123, 255, 0.3)',
  code: 'rgba(255, 255, 255, 0.2)'
};

// Define the colors for the dark theme
export const darkTheme: Theme = {
  body: '#121212',
  text: '#EAEAEA',
  background: '#1E1E1E',
  backgroundTwo: '#1E1E1E',
  backgroundThree: '#121212', 
  borderColor: '#333333',
  primary: '#007BFF',
  primaryHover: '#0056b3',
  boxShadow: 'rgba(0, 0, 0, 0.5)',
  buttonHoverBg: '#0062cc',
  textAlt: '#adb5bd',
  success: '#34c759',
  danger: '#ff453a',

  scrollbar: '#1E1E1E', 
  border: '#333333',
  borderBottom: '#121212',

  matchCard: 'rgba(0, 123, 255, 0.4)',
  code: 'rgba(255, 255, 255, 0.08)'
};