import React from 'react';
import { Screen, ScreenHeader } from '../ui';

// (en construcción)
export default function CookingGame({ onBack }) {
  return (
    <Screen>
      <ScreenHeader title="Cocina" onBack={onBack} />
    </Screen>
  );
}
