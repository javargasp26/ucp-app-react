import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza el título de la Universidad Católica de Pereira', () => {
  render(<App />);
  const titulo = screen.getByText(/¡Universidad Católica de Pereira !/i);
  expect(titulo).toBeInTheDocument();
});
