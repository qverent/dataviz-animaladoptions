// Global variables
var yearCurrent = "";
var selected = null;

// Chart 1 brush updates these as date objects
var brushedPeriodStart = new Date(2013, 10, 1);
var brushedPeriodEnd = new Date(2014, 10, 1);

// Load data
Promise.all([
    d3.json('data/chart1.json'),
    d3.csv('data/animals.csv')]).then(data => {

    // Convert chart1.json date strings to date objects
    const dateStringToObject = d3.timeParse("%Y-%m-%d");
    data[0].forEach(datum => {
        datum.value.forEach(d => dateStringToObject(d.timestamp));
        datum.value.forEach(d => Number(d.residentCount));
        datum.value.forEach(d => Number(d.adopted));    
    });

    // Convert animals.csv into date objects
    data[1].forEach(datum => {
        datum.date_in = datum.date_in = dateStringToObject(datum.date_in);
        if (datum.date_out !== "NA") datum.date_out = dateStringToObject(datum.date_out);
    });

    // Initialize visualizations
    var chart1 = new Chart1({
        data: data[0].map(datum => ({...datum})), // Deep clone
        parentElement: '#chart-1'
    });

    chart1.updateVis();

})
