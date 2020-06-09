/**
 * This code was used to process animals.csv file in a format that works for Chart 1.
 * The code was originally part of Chart1 but was extracted as processing on the fly takes too much time
 * The output was then printed to web console and saved as a JSON.
 */
d3.csv('data/animals.csv').then(data => {
  console.log('*** CHART1 PREPROCESSOR STARTS');
  const processedData = {};

  
    // Convert date strings to date objects
    const dateStringtoObject = d3.timeParse("%Y-%m-%d");
    data.forEach(datum => {
        datum.date_in = datum.date_in = dateStringtoObject(datum.date_in);
        if (datum.date_out !== "NA") datum.date_out = dateStringtoObject(datum.date_out);
    });

  
  // Get timestamps and intake data
  const dataGroupedByTimeTypeIntakes = d3.nest()
    .key(d => d3.timeMonth(d.date_in))
    .key(d=> d.type)
    .rollup(d => d.length)
    .object(data);
    let timestamps = Object.keys(dataGroupedByTimeTypeIntakes);
  console.log('dataGroupedByTime', dataGroupedByTimeTypeIntakes);


    // Get adoption count per month per animal type
    const dataGroupedByTypeTimeOutcome = d3.nest()
      .key(d => d.type)
      .key(d =>
        d.date_out === 'NA' ? 'NA' : d3.timeMonth(d.date_out))
      .key(d => d.outcome_type)
      .rollup(d => d.length) // Gets count
      .object(data);

      // For now we aren't working with livestock or birds
      delete dataGroupedByTypeTimeOutcome.Livestock;
      delete dataGroupedByTypeTimeOutcome.Bird;
      console.log('dataGroupedByTypeTimeOutcome', dataGroupedByTypeTimeOutcome);

    
      // Get resident count per month per animal type
      for (const animalType in dataGroupedByTypeTimeOutcome) {
        const typedData = data.filter(datum => datum.type === animalType);
        processedData[animalType] = [];
        timestamps.forEach(t => {
          let residentCount = 0;
          const timestampObject = new Date(t);
          const nextMonth = d3.timeMonth.offset(timestampObject);
          typedData.forEach(datum => {
            if (
              // Get animals who left during or after this month
              (datum.date_out === 'NA' || d3.timeDay.count(timestampObject, datum.date_out) >= 0)
              &&
              // Animals who entered the shelter during or before this month
              (d3.timeDay.count(nextMonth, datum.date_in) < 0))
              residentCount ++;
          });

          // Get number of animals who left during this time
          const currentEntry = dataGroupedByTypeTimeOutcome[animalType][t];
          let outcomes = 0;
          for (const outcomeType in currentEntry) {
            if (outcomeType !== 'In Shelter') outcomes += currentEntry[outcomeType];
          }

          // Key: animal type
          // Values: Array of {timestamp, adopted, decased, residentCount}
          processedData[animalType].push({
            timestamp: t,
            adopted: dataGroupedByTypeTimeOutcome[animalType][t]['Adopted'] || 0,
            deceased: dataGroupedByTypeTimeOutcome[animalType][t]['Deceased'] || 0,
            residentCount: residentCount, // All animals with intakes before during/month and outcomes during/after month
            outcomes: outcomes
            });
          });
      };

      // Combine with intakes
      for (const animalType in processedData) {
        processedData[animalType].forEach(datum => {
          datum.intakes = dataGroupedByTimeTypeIntakes[datum.timestamp][animalType];
        })
      }

      // Sort by timestamp
      for (const animalType in processedData) {
        processedData[animalType].sort((a, b) => d3.ascending(new Date(a.timestamp), new Date(b.timestamp)));
      };

      // Convert from dictionary to arrays
      const processedDataArrayForm = d3.entries(processedData);

      // Print to console and save a JSON file
      console.log('CHART1 PREPROCESSOR COMPLETE*****');
      console.log(processedDataArrayForm);
});