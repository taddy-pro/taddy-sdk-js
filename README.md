Simple usage
============
```ts
// Import Taddy SDK
import { Taddy } from 'taddy-sdk';

// Initialize SDK with your Public ID (pubId)
const taddy = new Taddy('miniapp-xxxxxxxxxxxxxxxxxxxxxxxx')

// Send "ready" event when your app is ready to use
taddy.ready();

// Get tasks
taddy.tasks({ limit: 4 }).then(tasks => {
  // Display tasks
  display(tasks)
  // Send "impressions" event to roll stats
  taddy.impressions(tasks);
})

// Alternative way
taddy.tasks({ limit: 4, autoImpressions: true }).then(tasks => {
  // Display tasks
  display(tasks)
})

// Open task via Telegram WebApp API
taddy.open(task).then(() => {
  // Task completed! 
  // Get reward, remove task from list, refresh tasks, etc...
}).catch(err => {
  // Something went wrong
})
```