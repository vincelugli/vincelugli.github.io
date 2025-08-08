
export interface Theme {
  body: string;
  text: string;
  secondaryText: string;
  background: string;
  backgroundTwo: string;
  backgroundThree: string, 
  borderColor: string;
  primary: string;
  primaryHover: string;
  boxShadow: string;
  buttonHoverBg: string;
  textAlt: string;
  success: string;
  danger: string;
  scrollbar: string;
  border: string;
  borderBottom: string;
  secondaryBorderBotton: string;
  matchCard: string;
  code: string;
  captains: string;
}


export const lightTheme: Theme = {
  body: '#F0F2F5',
  text: '#333333',
  secondaryText: '#555',
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
  secondaryBorderBotton: '#1E1E1E',
  matchCard: 'rgba(0, 123, 255, 0.3)',
  code: 'rgba(255, 255, 255, 0.2)',
  captains: '#d9534f'
};


export const darkTheme: Theme = {
  body: '#121212',
  text: '#EAEAEA',
  secondaryText: '#A0A0A0',
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
  secondaryBorderBotton: '#eee',
  matchCard: 'rgba(0, 123, 255, 0.4)',
  code: 'rgba(255, 255, 255, 0.08)',
  captains: '#4d1f1d'
};