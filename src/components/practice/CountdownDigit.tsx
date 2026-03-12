import React from 'react';

export const CountdownDigit = React.memo(({ value }: { value: number }) => (
  <span className="countdown font-mono text-5xl" aria-live="polite">
    <span style={{ '--value': value, '--digits': 2 } as React.CSSProperties} aria-live="polite" aria-label={String(value)} />
  </span>
));
