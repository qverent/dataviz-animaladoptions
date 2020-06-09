class c2Vis {

  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 600,
    }
    this.config.margin = _config.margin || { top: 0, bottom: 50, right: 30, left: 50 }
  }

  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    vis.xValue = d => d.date_out;
    vis.yValue = d => d.type;
    vis.outcome = d => d.outcome_type;

    vis.xScale = d3.scaleTime()
      .range([0, vis.width])
      .nice();

    vis.yScale = d3.scaleBand()
      .domain(['Cat', 'Dog', 'Other'])
      .range([0, vis.height])
      .paddingInner(1)
      .paddingOuter(0.5);

    vis.outcomes = ['Adopted', 'Returned to Owner', 'Transferred', 'Deceased'];

    vis.colorScale = d3.scaleOrdinal()
      .domain(vis.outcomes)
      .range(['#7fc97f', '#e8d0f5', '#386cb0', '#ffff99']);

    // Create legend
    vis.legend = d3.select('#c2-legend')
      .attr('width', 250)
      .attr('height', vis.config.containerHeight);

    vis.legend.append('g')
      .attr('transform', `translate(30, 20)`)
      .call(colorLegend, {
        vis,
        circleRadius: 10,
        ySpacing: 50,
        textOffset: 25
      });

    // Initialize axes
    const xAxisLabel = 'Time';
    const yAxisLabel = 'Adoptions';

    vis.xAxisG = vis.chart.append('g');
    const yAxisG = vis.chart.append('g')
      .attr('class', 'y-axis');

    vis.xAxisG.append('text')
      .attr('class', 'axis-label')
      .attr('y', 60)
      .attr('x', vis.width / 2)
      .text(xAxisLabel);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickSize(0)
      .tickSizeOuter(0)
      .tickPadding(15);

    yAxisG.append('text')
      .attr('class', 'axis-label')
      .attr('y', -60)
      .attr('x', -vis.height / 2)
      .attr('transform', `rotate(-90)`)
      .attr('text-anchor', 'middle')
      .text(yAxisLabel);

    const yAxis = d3.axisLeft(vis.yScale)
      .tickSize(0)
      .tickSizeOuter(0)
      .tickPadding(10);

    yAxisG.call(yAxis);
    yAxisG.select('.domain').remove();

    vis.update(brushedPeriodStart, brushedPeriodEnd);
  }

  update(start, end) {
    let vis = this;

    vis.xScale.domain([start, end]);

    vis.xAxisG.call(vis.xAxis)
      .attr('transform', `translate(0,${vis.height})`);
    vis.xAxisG.select('.domain').remove();
    vis.dates.filter([start, end]);
    // vis.outcome_dim.filter(d => vis.outcomes.includes(d));

    vis.active_data = vis.data.allFiltered();

    vis.render();
  }

  render() {
    let vis = this;

    vis.circles = vis.chart.selectAll('circle').data(vis.active_data);
    vis.circlesEnter = vis.circles.enter().append('circle');

    vis.circleRadius = 5;
    const yJitter = 20;

    vis.circlesEnter
      .attr('cx', d => vis.xScale(d.date_out))
      .attr('stroke', 'black')
      .merge(vis.circles)
      .attr("Age", d => d['age_out'])
      .attr("Color", d => d['color'])
      .attr("Type", d => d['type'])
      .attr('r', d => vis.outcomes.includes(d.outcome_type) ? vis.circleRadius : 0)
      .attr('cy', (d, i) => {
        return i % 2 == 0 ?
          vis.yScale(d.type) + Math.random() * yJitter
          : vis.yScale(d.type) - Math.random() * yJitter
      })
      .attr('class', d => {
        if (vis.outcome(d) === 'Returned to Owner') return 'rto';
        return vis.outcome(d).toLowerCase();
      })
      .attr('fill', d => vis.colorScale(vis.outcome(d)))
      .on('mouseover', d => vis.onHover(d))
      .on('mouseout', () => vis.onMouseOut());

    vis.circles.transition()
      .attr('cx', d => vis.xScale(d.date_out));

    vis.circles.exit().remove();

    // vis.simulation = d3.forceSimulation(vis.active_data)
    //   .force('collide', d3.forceCollide().radius(vis.circleRadius))
    //   .force('x', d3.forceX(d => vis.xScale(d.date_out)))
    //   .force('y', d3.forceY(d => vis.yScale(d.type)))
    //   .on('tick', vis.ticked);
  }

  onHover = animal => {
    let vis = this;
    let parseTime = d3.timeFormat("%Y-%m-%d");

    vis.tooltip.transition()
      .style('opacity', 0.9);

    vis.tooltip.html(animal.name + '<br/>'
      + animal.breed + '<br/>'
      + 'Intake date: ' + parseTime(animal.date_in) + '<br/>'
      + 'Outcome: ' + animal.outcome_type + '<br/>'
      + 'Outcome date: ' + parseTime(animal.date_out))
      .style('left', d3.event.pageX + 'px')
      .style('top', d3.event.pageY + 20 + 'px');

    var ageClass = animal.type + "-" + animal.age_out;
    var colorClass = animal.type + "-" + animal.color;
    d3.selectAll(`rect#${ageClass}`).classed("selectedClass", true);
    d3.selectAll(`rect#${colorClass}`).classed("selectedClass", true)
  }

  onMouseOut = () => {
    let vis = this;

    vis.tooltip.transition()
      .style('opacity', 0);

    d3.selectAll(`.selectedClass`).classed("selectedClass", false);
  }

  onClick = outcome => {
    let vis = this;
    let legend_filter = d3.selectAll('.c2-legend');
    if (vis.outcomes.includes(outcome)) {
      vis.outcomes.splice(vis.outcomes.indexOf(outcome), 1);
    }
    else {
      vis.outcomes.push(outcome);
    }
    legend_filter
      .transition()
      .attr('opacity', d => vis.outcomes.includes(d) ? 1 : 0.5);
    vis.circlesEnter.merge(vis.circles).transition()
      .attr('r', d => vis.outcomes.includes(d.outcome_type) ? vis.circleRadius : 0);
  }

  ticked = () => {
    let vis = this;

    vis.circles
      .attr('cy', d => d.y);
  }
}

const colorLegend = (selection, props) => {
  const {
    vis,
    circleRadius,
    ySpacing,
    textOffset
  } = props;

  const outcome = selection.selectAll('.c2-legend').data('g')
    .data(vis.colorScale.domain());
  const outcomeEnter = outcome.enter().append('g');
  outcomeEnter
    .merge(outcome)
    .attr('transform', (d, i) => `translate(0, ${40 + i * ySpacing})`);
  outcome.exit().remove();

  outcomeEnter.append('circle')
    .merge(outcome)
    .attr('r', circleRadius)
    .attr('stroke', 'black')
    .attr('fill', vis.colorScale)
    .attr('class', d => {
      if (d === 'Returned to Owner') return 'c2-legend rto';
      if (d === 'In Shelter') return 'c2-legend shelter';
      return 'c2-legend ' + d.toLowerCase();
    })
    .on('click', d => vis.onClick(d));

  outcomeEnter.append('text')
    .merge(outcome.select('text'))
    .text(d => d)
    .attr('x', textOffset)
    .attr('dy', '0.33em');
}