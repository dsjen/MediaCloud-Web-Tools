import ReactGA from 'react-ga';
import { setAppName, setVersion, APP_SOURCE_MANAGER } from './config';
import { setAppColors } from './styles/colors';
import routes from './routes/sourceRoutes';
import initializeApp from './index';

/**
 * This serves as the primary entry point to the Media Cloud Source Manager app.
 */

ReactGA.initialize('UA-60744513-8');

setVersion('3.6.0');

setAppName(APP_SOURCE_MANAGER);

setAppColors({
  light: '#5CB6DD',
  dark: '#3C96BD', // primary
  darker: '#1C769D',
  main: '#3C96BD',
});

initializeApp(routes);
