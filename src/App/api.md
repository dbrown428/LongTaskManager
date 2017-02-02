
### Rest API
- add: request JSON - taskType, params: string, ownerId, string, searchKey: array <string>
- cancel: response JSON -
- delete: response JSON - 
- tasksForSearchKey: response JSON - array of task objects
- tasksForUserId: response JSON - array of task objects
- taskProcessorKeys: response JSON - Array of Strings

###### Internal
- start

#### ApiConfiguration
- logger
- register task processors...

// register processors? or just a way to retrieve task processor ids?
// - how do you ensure cross boundary type safety? Or just ignore it?

// The API could directly talk to the repository. It doesn't necessarily have
// to go through the LongTaskManager.