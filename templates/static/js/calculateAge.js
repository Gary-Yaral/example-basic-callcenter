
function calculateYear(date){
    var born = new Date(date);
    var today = new Date();
    return parseInt((today - born) / (1000*60*60*24*365));
}


export {calculateYear}