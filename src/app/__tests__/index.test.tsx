import { render, screen } from '@testing-library/react-native';

import Index from '../index';

describe('Index screen', () => {
  it('zeigt den App-Namen', async () => {
    await render(<Index />);
    expect(screen.getByText('Cash4Bricks')).toBeOnTheScreen();
  });
});
