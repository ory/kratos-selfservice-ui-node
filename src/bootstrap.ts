// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HoneycombSDK } from '@honeycombio/opentelemetry-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

// uses HONEYCOMB_API_KEY and OTEL_SERVICE_NAME environment variables
const sdk: NodeSDK = new HoneycombSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk
  .start()
  .then(() => {
    console.log('Tracing initialized');
  })
  .catch((error) => console.log('Error initializing tracing', error));

import "./index"
