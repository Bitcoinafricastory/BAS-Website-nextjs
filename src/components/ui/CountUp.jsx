'use client';

import CountUp from 'react-countup';

export default function CountUpComponent({ end, suffix = '+', duration = 4 }) {
  return <CountUp end={end} duration={duration} suffix={suffix} enableScrollSpy scrollSpyOnce />;
}
