class Histogram {
    constructor(_config) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 600,
        containerHeight: _config.containerHeight || 600,
        chartType: _config.chartType,
        categories: _config.categories
      }
    }
    
    initVis() {
      let vis = this;
      
      vis.categories = vis.config.categories;
      vis.margins = {top: 5, right: 10, bottom: 40, left: 45};
      vis.innerWidth = vis.config.containerWidth - vis.margins.left - vis.margins.right;
      vis.innerHeight = vis.config.containerHeight - vis.margins.top - vis.margins.bottom;
      vis.svg = d3.select(vis.config.parentElement)
          .append('svg')
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight)
          .append("g")
            .attr("transform", `translate(${vis.margins.left}, ${vis.margins.top})`);

      vis.xScale = d3.scaleBand()
            .domain(vis.categories)
            .range([0, vis.innerWidth]);

      vis.xAxis = vis.svg.append('g')
        .attr("class", 'histogram-xaxis')
        .attr("transform", `translate(0, ${vis.innerHeight})`)
        .call(d3.axisBottom(vis.xScale));

      // const xTicks = d3.selectAll('.histogram-xaxis .tick text');
      // xTicks.attr('text-anchor', 'middle');
      // xTicks.attr('transform', 'rotate(-90)');

      vis.yScale = d3.scaleLinear()
      vis.yAxis = vis.svg.append('g');

      vis.update(brushedPeriodStart, brushedPeriodEnd);
    }
  
    update(startDate, endDate) {
      if (startDate === undefined || endDate === undefined) {
        return;
      }

      let vis = this;
      vis.counts = {};
      vis.categories.forEach( category => {
          vis.counts[category] = {'Cat': 0, 'Dog': 0, 'Other': 0}
      });

      vis.data.forEach( d => {
          var attribute = d[vis.config.chartType];

          // Don't count the animals that are out of the brushed date range in Chart 1
          // ie. Animal date_in after end date OR date_out before end date
          if (d['date_in'] > endDate || d['date_out'] < startDate) {
            return;
          }

          if (d['type'] == 'Bird' || d['type'] == 'Livestock') {
            vis.counts[attribute]['Other'] += 1;
          } else {
            vis.counts[attribute][d['type']] += 1;
          }
      })
      
      var values = Object.values(vis.counts)
                    .map( obj => Object.values(obj)).flat();
      vis.yScale = d3.scaleLinear()
                .domain([0, Math.max(...values)])
                .range([vis.innerHeight, 0]);

      vis.yAxis.call(d3.axisLeft(vis.yScale).tickSizeOuter(0));
      vis.render();
    }

    onHover(info) {
      d3.selectAll(`circle`)
        .classed("selectedClass", circ => {
          return circ['type'] === info["AnimalType"] && 
              (circ['color'] === info["Category"] || circ['age_out'] === info["Category"]);
        });
      }

    onMouseOut() {
      d3.selectAll(`.selectedClass`).classed("selectedClass", false);
    }
  
    render() {
      let vis = this;

      var countArray = [];
      Object.keys(vis.counts).forEach( c => {
          var countsByAnimal = vis.counts[c];
          Object.keys(countsByAnimal).forEach ( animal => {
              var obj = {};
              obj["Category"] = c;
              obj["AnimalType"] = animal;
              obj["Count"] = countsByAnimal[animal];
              countArray.push(obj);
          })
      })

      let marks = vis.svg.selectAll('rect').data(countArray);
      let marksEnter = marks.enter().append('g');

      let barWidth = vis.xScale.bandwidth() / 4;
      let animalScale = {'Cat': 0, 'Dog': 1, 'Other': 2};

      marksEnter.append('rect')
        .merge(marks)
            .attr('id', d => d["AnimalType"] + "-" + d["Category"])
            .attr('class', d => d["AnimalType"])
            .attr('x', d => (barWidth / 2)
                            + (animalScale[d['AnimalType']] * barWidth)
                            + vis.xScale(d["Category"]))
            .attr('y', d => vis.yScale(d['Count']))
            .attr('width', barWidth)
            .attr('height', d => vis.innerHeight - vis.yScale(d['Count']))
            .on('mouseover', d => vis.onHover(d))
            .on('mouseout', () => vis.onMouseOut())
            .append('title').text(d => d['Count']);
      marks.exit().remove();
    }
  }