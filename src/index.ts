import express from 'express';
import handlebars from 'express-handlebars';
import {
  register404Route,
  register500Route,
  registerErrorRoute,
  registerHealthRoute,
  registerLoginRoute,
  registerRecoveryRoute,
  registerRegistrationRoute,
  registerSettingsRoute,
  registerStaticRoutes,
  registerVerificationRoute,
  registerWelcomeRoute,
} from './routes';
import { toUiNodePartial } from './pkg/ui';
import { middleware as middlewareLogger } from './pkg/logger';
import { ui } from '@ory/integrations';
import { UiNode } from '@ory/client';

const app = express();

app.use(middlewareLogger);
app.set('view engine', 'hbs');

app.engine(
  'hbs',
  handlebars({
    extname: 'hbs',
    layoutsDir: `${__dirname}/../views/layouts/`,
    partialsDir: `${__dirname}/../views/partials/`,
    defaultLayout: 'main',
    helpers: {
      ...require('handlebars-helpers')(),
      jsonPretty: (context: any) => JSON.stringify(context, null, 2),
      onlyNodes: ui.filterNodesByGroups,
      toUiNodePartial: (node: UiNode) => {
        console.log(node)
        return toUiNodePartial(node)
      },
      getNodeLabel: ui.getNodeLabel,
    },
  }),
);


registerStaticRoutes(app);
registerHealthRoute(app);
registerLoginRoute(app);
registerRecoveryRoute(app);
registerRegistrationRoute(app);
registerSettingsRoute(app);
registerVerificationRoute(app);
registerWelcomeRoute(app);
registerErrorRoute(app);
registerWelcomeRoute(app);

register404Route(app);
register500Route(app);

const port = Number(process.env.PORT) || 3000;
const listener = () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
};

app.listen(port, listener);
