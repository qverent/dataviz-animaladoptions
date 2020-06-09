let agesCategories = ['Baby', 'Young', 'Adult', 'Senior', 'Unknown', 'N/A'];

let colourCategories = ['Black', 'Gray', 'Green', 'Brown', 'Cream', 'Orange', 'Pink',
                'Red','White', 'Yellow', 'Mixed'];

let ageChart = new Histogram( {
                                parentElement: '#chart-3-1', 
                                containerWidth: document.getElementById('chart-3-1').offsetWidth,
                                // containerHeight: document.getElementById('chart-3-1').offsetHeight,
                                containerHeight: 200,
                                categories: agesCategories, 
                                chartType: 'age_out'});
let colourChart = new Histogram({
                        parentElement: '#chart-3-2', 
                        containerWidth: document.getElementById('chart-3-2').offsetWidth,
                        // containerHeight: document.getElementById('chart-3-2').offsetHeight,
                        containerHeight: 200,
                        categories: colourCategories, 
                        chartType: 'color'});


d3.csv('data/animals.csv').then( data => {
    data.forEach(d => {
        d["date_in"] = new Date(d["date_in"]);
        d["date_out"] = new Date(d["date_out"]);
    })

    ageChart.data = data;
    colourChart.data = data;

    ageChart.initVis();
    colourChart.initVis();
})