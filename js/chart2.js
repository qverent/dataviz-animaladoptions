let chart2 = new c2Vis({ parentElement: "#c2-vis", containerWidth: 900, containerHeight: 330 });

Promise.all([
    d3.csv('data/animals_sample.csv')
  ]).then(files => {
    let animals = files[0];

    let parseTime = d3.timeParse("%Y-%m-%d");

    animals.forEach(d => {
        d.date_in = parseTime(d.date_in);
        d.date_out = parseTime(d.date_out);
    })

    const animal = crossfilter(animals);

    let dates = animal.dimension(d => d.date_out);
    let outcomes = animal.dimension( d => d.outcome_type);

    chart2.data = animal;
    chart2.dates = dates;
    chart2.outcome_dim = outcomes;
    chart2.initVis();
  });
