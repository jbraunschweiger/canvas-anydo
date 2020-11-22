# canvas-anydo

## What is this Project?

[Canvas](https://www.instructure.com/canvas/) is a popular Learning Management tool, common among Colleges and Universities in the U.S.  
[any.do](https://www.any.do) is a self described "productivity platform." IMO, it is the perfect marriage  of a task list and a calendar.  

My issue with using planner and task tracking apps is keeping them up to date. I realized that most of my "tasks" tend to be duplicates of canvas Assignments, so I wrote this firebase function to generate them for me. The way I have it set up right now, the function checks once a day to see if there are any new assignments on my Canvas account, and if there are it ads them to my any.do as tasks.

## Implementation

The function is structured to run on firebase.  
It uses the official Canvas API, and an unofficial Any.do API Client to make the data handshake, and firestore to track logs and avoid duplicate entries.  
It uses GCP pub/sub to schedule the run, and is set to activate daily at 1:00 AM EST by default.

Technologies
  - Node
    - [anydo-api](https://www.npmjs.com/package/anydo-api)
    - firebase
    - request-promise
  - Firebase
    - Firebase CLI
    - Firestore
    - Functions
    
 ## Using canvas-anydo for Yourself
 
 Note: This is something I hacked together in one morning; I can't garuntee code stability. If you still want to use it, here are the steps:  
 
 __Initialize Firebase Project__  
 
 `$ git clone https://github.com/jbraunschweiger/canvas-anydo.git`  
 `$ cd canvas-anydo`  
 `$ firebase init`  
  
When prompted, add firestore and functions to your project. You may need to enable firestore in the firebase console and then run firebase init a second time.  
Add payment information to your firebase account and select the ember plan, you won't have to pay anything since you're only making one request per day.  
  
__Configure Firestore__
  
Create an "assignment-logs" collection, and call it's first document "log-1". Add three array fields to this log: `assignments`, `courses`, and `course_names`.  
`assignments` should start with one dummy string in the list.  
`courses` should have a string entry holding the id of each course you want the function to see assignments from. You can find an id in the course page url on canvas. Canvas url's are structured like this: `https://[school].instructure.com/courses/[course_id]`.  
`course_names` should have a string entries, corresponding to the course_id in the same index of `courses`. This string is the name of the class that is prepended to assignment name to make the task title. (e.g. if `courses[0]` is the id for your algorithms course, you would put something like "Algorithms" in `course_names[0]`)  
  
__Gather Information__
  
Get together your any.do email and password.  
Generate a Canvas Developer API key, if you need help, check out the [docs](https://canvas.instructure.com/courses/785215/pages/getting-started-with-the-api).  
  
__Configure Functions__
  
Add your config variables to functions:  
`$ firebase functions:config:set email.key="[YOUR EMAIL]" email.id="email"`  
`$ firebase functions:config:set canvas.key="[YOUR CANVAS API KEY]" canvas.id="api_key"`  
`$ firebase functions:config:set anydo.key="[YOUR ANYDO PASSWORD]" canvas.id="api_key"`  
Deploy:  
`$ firebase deploy --only functions`  

