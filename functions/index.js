const functions = require('firebase-functions');
const request = require('request-promise');

const admin = require('firebase-admin');
admin.initializeApp();

const Api = require('anydo-api');
const anydo = new Api(functions.config().email.email, functions.config().anydo.api_key);


exports.addNewAssignmentsScheduled = functions.pubsub.schedule('0 1 * * *').timeZone('America/New_York').onRun( async (context) => {
    const db = admin.firestore();

    const log = await db.collection("assignment-logs").doc("log-1").get();
    var logList = log.data().assignments;
    const courseList = log.data().courses;
    const courseNames = log.data().course_names;
    
    var coursePromises = [];

    courseList.forEach((course_id) => {
        const a = getAssignments(course_id, "upcoming");
        coursePromises.push(a);
    })

    courseList.forEach((course_id) => {
        const a = getAssignments(course_id, "future");
        coursePromises.push(a);
    })

    var courses = await Promise.all(coursePromises);

    console.log(courses);

    var assignmentPromises = [];

    courses.forEach((assignmentsRaw, index) => {
        const assignments = JSON.parse(assignmentsRaw);
        const assignmentPromise = publishTasks(assignments, logList, courseList[index % courseList.length], courseNames[index % courseNames.length]);
        assignmentPromises.push(assignmentPromise);
    })

    var assignmentLogs = await Promise.all(assignmentPromises);

    var newLogList = logList;

    assignmentLogs.forEach((log) => {
        newLogList = newLogList.concat(log);
    })

    await db.collection("assignment-logs").doc("log-1").update({assignments: newLogList});

    return null;
})

async function getAssignments(course_id, bucket) {
    return request({
        url: 'https://wustl.instructure.com/api/v1/courses/' + course_id + '/assignments?bucket=' + bucket,
        headers: {
           'Authorization': 'Bearer ' + functions.config().canvas.api_key,
           'Content-Type': 'application/json'
        },
        rejectUnauthorized: false
    });
}

async function publishTasks (assignments, logList, course_id, course_name) {
    var tasks = [];
    var logs = [];
    assignments.forEach((assignment) => {
        const assignment_id = course_id + '/' + String(assignment.id);
        const title = course_name + ' - ' + assignment.name;
        const dueDate = Date.parse(assignment.due_at);

        if(!logList.includes(assignment_id)) {
            logs.push(assignment_id);
            tasks.push({
                title: title,
                dueDate: dueDate
            })
        }
    });

    await anydo.addTasks(tasks);

    return logs;
}