module.exports = {
  enumerateDaysBetweenDates: function(startDate, endDate) {
     var dates = [];

     var currDate = startDate.clone().startOf('day');
     var lastDate = endDate.clone().startOf('day');

     while(currDate.add(1, 'days').diff(lastDate) <= 0) {
         dates.push(currDate.clone().toDate());
     }
     dates.push(endDate.clone().add(1, 'days').toDate());
     return dates;
 },
stringToBoolean: function(string){
     switch(string.toLowerCase().trim()){
         case "true": case "yes": case "1": return true;
         case "false": case "no": case "0": case null: return false;
         default: return Boolean(string);
     }
 }
}
