import styled, { css } from 'styled-components';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
}

// Define the styles for each variant
const variants = {
  primary: css`
    background-color: #007bff;
    color: white;
    border: 2px solid transparent;

    &:hover {
      background-color: #0056b3;
    }
  `,
  secondary: css`
    background-color: #6c757d;
    color: white;
    border: 2px solid transparent;

    &:hover {
      background-color: #5a6268;
    }
  `,
};

const Button = styled.button<ButtonProps>`
  /* Base styles that apply to all buttons */
  width: 100%;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1rem;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  /* Apply variant styles, defaulting to 'primary' */
  ${({ variant = 'primary' }) => variants[variant]}
`;

export default Button;
