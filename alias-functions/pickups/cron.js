var CronJob = require('cron').CronJob;
var job = new CronJob(date, function() {
  console.log('You will see this message every second');
}, null, true, 'America/New_York');
job.start();

const date = new Date();
date.setDate(date.getDate() + 30);

console.log(date);

function setTimeoutCronJob() {

}


// cron job that runs every day to check if user needs timeout[userName][0] removed. If diff between date.now() and date at index 0 is less than or equal to 1 day, timeout[userName][0].shift().



const object = {
    "users": [],
    "timeout": []
}

if(Object.keys(object).length === 0)  {
    //stop cronJob
}


var job = new CronJob('* * * * * *', function() {

});