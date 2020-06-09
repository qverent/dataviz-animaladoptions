class Chart1 {
    constructor(_config) {
        this.config = {
            data: _config.data,             // All animals in the JSON have the same dates sorted in the same order
            parentElement: _config.parentElement,
            svgHeight: _config.svgHeight || 200,
            svgWidth: _config.svgWidth || '100%'
        }

        this.initVis();
    }
  
    brush = null;
    chart = null;
    chartHeight = 0;
    chartWidth = 0;
    margin = {top: 5, right: 10, bottom: 40, left: 30};
    svg = null;
    xAxis = null;
    yAxis = null;
    xScale = null;
    yScale = null;

    initVis(){
        const vis = this;  

        // Set up canvas
        vis.svg = d3.select(vis.config.parentElement).append('svg')
            .attr('height', vis.config.svgHeight)
            .attr('id', 'chart-1-svg')
            .attr('width', vis.config.svgWidth);

        vis.chart = vis.svg.append('g')
            .attr('id', 'chart-1-chart')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);
    
        vis.chartHeight = vis.config.svgHeight - vis.margin.top - vis.margin.bottom; // Left margin for y-axis
        vis.chartWidth =  $('#chart-1-svg').width() - vis.margin.left - vis.margin.right;  // Right margin for x-axis
           
        // Scales and axes
        vis.xScale = d3.scaleTime()
        .range([0, vis.chartWidth])
        .nice(); 
        
        vis.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([vis.chartHeight, 0]); 

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(75) // TODO Feed in only January and June
            .tickFormat(d => new Date(d).getMonth() === 5 ? d3.timeFormat("%b")(d) : d3.timeFormat("%Y")(d))
            .tickPadding(2)
            .tickSize(0);

        vis.yAxis = d3.axisLeft(vis.yScale)
            .tickPadding(8)
            .tickSize(0);
        
        // Brush
        vis.chart.attr('viewBox', [0, 0, vis.chartWidth, vis.chartHeight ]);

        vis.brush = d3.brushX()
          .extent([[0, 0], [vis.chartWidth, vis.chartHeight]])
          .on('end', ()=>{
            // Update global variables
            brushedPeriodStart = d3.timeMonth.floor(vis.xScale.invert(d3.event.selection[0]));
            brushedPeriodEnd = d3.timeMonth.ceil(vis.xScale.invert(d3.event.selection[1]));

            chart2.update(brushedPeriodStart, brushedPeriodEnd);

            // Call updates on Chart 3
            if (ageChart.data !== undefined && colourChart.data !== undefined) {
              ageChart.update(brushedPeriodStart, brushedPeriodEnd);
              colourChart.update(brushedPeriodStart, brushedPeriodEnd);
            }
            
            vis.handleBrush();
          });
    }

    updateVis(){
      // Sort data
        const vis = this;

        // Update data-dependent scale
        vis.xScale.domain(d3.extent(vis.config.data[0].value, d => new Date(d.timestamp)));   
        vis.renderVis(vis.config.data);
    }

    renderVis(processedData){
      const vis = this;
        // Draw axes
        const xAxisGroup = vis.chart.append('g').call(vis.xAxis)
          .attr('class', 'chart1-xAxis')
          .attr('transform', `translate(0, ${vis.chartHeight})`);

        const xTicks = d3.selectAll('.chart1-xAxis .tick text');
        xTicks.attr('text-anchor', 'middle');
        xTicks.attr('transform', 'rotate(-90)');
        xTicks.attr('x', -20);
        xTicks.attr('class', d => (d.getMonth() !==5 && d.getMonth() !== 0) ? 'hide' : '')

        const yAxisGroup = vis.chart.append('g').call(vis.yAxis);
        yAxisGroup.append('text')
          .attr('class', 'axis-label')
          .attr('text-anchor', 'middle')
          .attr('transform', 'rotate(-90)')
          .attr('x', -100)
          .attr('y', -30)
          .text("Adoption rate (%)");

        // Draw data elements
        const lineGenerator = d3.line()
          .x(d => {
            return vis.xScale(new Date(d.timestamp));
          })
          .y(d=> vis.yScale((d.adopted / d.residentCount) * 100));

        vis.chart.selectAll('.line').data(processedData)
            .enter().append('path')
            .attr('class', d => {
              if (d.key==='Dog') return 'line dog';
              if (d.key==='Cat') return 'line cat';
              return 'line other';
            })
            .attr('d', d => lineGenerator(d.value));
        
        // Brush
        vis.chart.append('g')
        .call(vis.brush)
        .call(vis.brush.move, [vis.xScale(new Date(2013, 10, 1)), vis.xScale(new Date(2014, 10, 1))]); // TODO Check where we want to default the brush
    }

    handleBrush(){
      const vis = this;

      // Update Stat box dates
      document.getElementById('chart-1-stat-box-date').innerHTML = brushedPeriodStart.toLocaleDateString('en-CA', {month: 'long', year: 'numeric'}) + '-' + brushedPeriodEnd.toLocaleDateString('en-CA', {month: 'long', year: 'numeric'});
      
      // Convert dates to array indices
      // All animals in the JSON have the same dates sorted in the same order
      const start = brushedPeriodStart.toString();
      const end = brushedPeriodEnd.toString()
      const startIndex = vis.config.data[0].value.findIndex(d => d.timestamp === start);
      const endIndex = vis.config.data[0].value.findIndex(d => d.timestamp === end);

      // Update Stat Box resident count
      // This takes the start month - 1's resCount + all intakes during selected period - all outcomes during selected period
      // Simply summing up each month's resCount would double count, so I had to do this
      vis.config.data.forEach(animalType => {
        let i, resCount;
        if (startIndex === endIndex) resCount = animalType.value[startIndex].residentCount;
        else if (startIndex <= 0 ) {
          resCount = animalType.value[startIndex].residentCount;
          for (i = startIndex + 1; i <= endIndex; i ++) {
            resCount += animalType.value[i].intakes;
            resCount -= animalType.value[i].outcomes;
          }
        }
        else {
          resCount = animalType.value[startIndex - 1].residentCount;
          for (i = startIndex; i <= endIndex; i ++) {
            resCount += animalType.value[i].intakes;
            resCount -= animalType.value[i].outcomes;
          }
        }
        document.getElementById(`statistic-${animalType.key.toLowerCase()}-residents`).innerHTML = resCount;
      });

      // Update Stat Box death and intake count
      vis.config.data.forEach(animalType => {
        let deceasedCount = 0;
        let intakeCount = 0;
        let i;
        for (i=startIndex; i <= endIndex; i ++) {
          deceasedCount += animalType.value[i].deceased;
          intakeCount += animalType.value[i].intakes;
        }
        document.getElementById(`statistic-${animalType.key.toLowerCase()}-deaths`).innerHTML = deceasedCount;
        document.getElementById(`statistic-${animalType.key.toLowerCase()}-intakes`).innerHTML = intakeCount;
      })
    }
}