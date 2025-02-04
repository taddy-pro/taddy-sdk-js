Simple usage
============
```ts
// Import
import { Taddy } from 'taddy-sdk';

// Initialize SDK with your Public ID (pubId)
const taddy = new Taddy('miniapp-xxxxxxxxxxxxxxxxxxxxxxxx')

// Sending "ready" event when your app is ready to use
taddy.ready();

// Gettings tasks
taddy.tasks({ limit: 4 }).then(tasks => {
  // display tasks
  display(tasks)
  // Sending "impressions" event to roll stats
  taddy.impressions(tasks);
})

// Or getting tasks with auto-impressions
taddy.tasks({ limit: 4, autoImpressions: true }).then(tasks => {
  // display tasks
  display(tasks)
})
```