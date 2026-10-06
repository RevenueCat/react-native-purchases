import React from 'react';
import MaestroApp, {MaestroAppProps} from '../maestro/app/App';

const API_KEY = 'MAESTRO_TESTS_REVENUECAT_API_KEY';

export default function App(props: MaestroAppProps) {
  return <MaestroApp {...props} apiKey={API_KEY} />;
}
