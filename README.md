### Proof of Concept
# Long Task Manager

As per conversations with Ryan and Adrian, here's a long-task manager proof of concept. No classes or organization of the code, just the basics.

The task list is an array of web resources (images & videos) that will be downloaded to demonstrate the blocking operation, while the manager concurrently retrieves and executes the next task, up to the maximum concurrent tasks limit.

The manager tracks how many tasks are being processed, and will back-off scheduling the next tick if it's already busy. Also if there are no remaining tasks in the list, the manager will back-off. The back-off is exponential.


##### 1. Install
`npm install`

##### 2. Run
`node src/long-task-manager.js`
