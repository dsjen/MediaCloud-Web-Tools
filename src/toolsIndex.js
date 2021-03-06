import ReactGA from 'react-ga';
import { setAppName, setVersion, APP_TOOLS } from './config';
import { setAppColors } from './styles/colors';
import routes from './routes/toolsRoutes';
import initializeApp from './index';

/**
 * This serves as the primary entry point to the Media Cloud Topic Mapper app.
 */

ReactGA.initialize('UA-60744513-9');

setVersion('3.5.4');

setAppName(APP_TOOLS);

setAppColors({
  light: '#BDBDBD',
  dark: '#616161',
  darker: '#1F1F1F',
  main: '#616161',
});

initializeApp(routes);
