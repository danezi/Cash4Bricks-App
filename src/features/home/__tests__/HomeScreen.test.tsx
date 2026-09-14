import { fireEvent, render, screen } from '@testing-library/react-native';

import { HomeScreen } from '@/features/home/HomeScreen';

describe('HomeScreen', () => {
  it('zeigt die drei Einstiege und löst die passende Navigation aus', async () => {
    const onScanPress = jest.fn();
    const onDashboardPress = jest.fn();
    const onHowItWorksPress = jest.fn();

    await render(
      <HomeScreen
        onScanPress={onScanPress}
        onDashboardPress={onDashboardPress}
        onHowItWorksPress={onHowItWorksPress}
      />,
    );

    expect(screen.getByText('Cash4Bricks')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Scan starten'));
    expect(onScanPress).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByText('Anmelden'));
    expect(onDashboardPress).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByText('Ablauf ansehen'));
    expect(onHowItWorksPress).toHaveBeenCalledTimes(1);
  });
});
