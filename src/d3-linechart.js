import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {

    // global variables for chart
    margin = {top: 20, right: 80, bottom: 60, left: 50};
    width = 960;
    height = 500;
    ylabel = 'Values';
    xlabel = 'Dates';
    columns = [];
    x = {};
    y = {};
    z = {};
    line = {};
    svg = {};

    constructor(props) {
        super(props);
        this.initLineChart = this.initLineChart.bind(this);
        this.updateLineChart = this.updateLineChart.bind(this);
        this.createLines = this.createLines.bind(this);
        this.createLegend = this.createLegend.bind(this);
        this.createAxes = this.createAxes.bind(this);
    }

    componentDidMount() {
        this.initLineChart();
    }

    componentDidUpdate() {
        this.updateLineChart();
    }

    // initializes chart and creates it
    initLineChart(){
        // the dom element
        const node = this.node;

        this.x = d3.scaleTime().range([0, this.width]);
        this.y = d3.scaleLinear().range([this.height, 0]);
        this.z = d3.scaleOrdinal(d3.schemeCategory10);

        // function that creates the line
        this.line = d3.line()
            .curve(d3.curveBasis)
            .x(d => this.x(d.date) )
            .y(d => this.y(d.value) );

        // svg object
        this.svg = d3.select(node)
                    .append('svg')
                    .attr('width', this.width + this.margin.left + this.margin.right)
                    .attr('height', this.height + this.margin.top + this.margin.bottom)
                    .append('g')
                    .attr( 'transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')' );

    }

    // function to update chart for new data
    updateLineChart(){
        this.columns = this.props.root.columns.slice(1);

        // x axis scale controller
        this.x.domain( d3.extent(this.props.root, d => d.date ) );

        // y axis scale controller
        this.y.domain([
            d3.min(this.props.data, function(c) { return d3.min(c.values, function(d) { return d.value; }); }),
            d3.max(this.props.data, function(c) { return d3.max(c.values, function(d) { return d.value; }); })
        ]);

        // colors for each attribute
        this.z.domain(this.props.data.map(function(c) { return c.attribute; }));

        this.svg.selectAll('.legend-container').remove();
        this.svg.selectAll('.axis').remove();

        this.createAxes();
        this.createLegend();

        // create chart
        this.createLines(this.props.data);
    }

    // function to create axes
    createAxes(){
        // create x axis
        this.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x))
            .append("text")
              .attr("x", this.width/2)
              .attr("dy", "3.5em")
              .attr("dx", "0.71em")
              .style("font-size","12px")
              .style("font-weight","bold")
              .attr("fill", "#000")
              .text(this.xlabel);

        // create y axis
        this.svg.append("g")
              .attr("class", "axis axis--y")
              .call(d3.axisLeft(this.y))
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("x", -this.height/2)
              .attr("dy", "-3.5em")
              .attr("fill", "#000")
              .style("font-size","12px")
              .style("font-weight","bold")
              .text(this.ylabel);
    }

    // function to create legend
    createLegend(){

        let self = this;

        // create legend and selectable attributes to show
        let legend = this.svg.selectAll(".legend-container")
            .data(this.columns)
            .enter().append("g")
            .attr('transform', 'translate(20, 10)')
            .attr("class", "legend-container")
            .on('click', function(d){

                var rect = d3.select(this).select('.legend-box'),
                    clicked = rect.classed('legend-box-clicked');

                if(clicked){
                    rect.classed('legend-box-clicked', false);
                } else {
                    rect.classed('legend-box-clicked', true);
                }

                // get selected attributes to show in chart
                var selected = [];
                d3.selectAll('.legend-box-clicked').each(function(k){
                    selected.push(k);
                });

                // filter data based on attributes selected
                var newdata = self.props.data.filter(function(k){
                    return selected.indexOf(k.attribute) !== -1;
                });

                // update chart
                self.createLines(newdata);

            });

        legend.append('rect')
            .attr('width', 120)
            .attr('height', 25)
            .attr('x', (d,i) => { return i*130; })
            .attr('class', 'legend-box legend-box-clicked');

        legend.append('circle')
            .attr('r', 5)
            .style('fill', d => this.z(d))
            .attr('cx', (d,i) => { return i*130 + 10; })
            .attr('cy', 12.5);

        legend.append('text')
            .attr('x', (d,i) => { return i*130 + 20; })
            .attr('y', 17 )
            .text(String);
    }

    // create / update lines in chart
    createLines(data){

        let attrdat = this.svg.selectAll(".attr")
            .data(data, d => d.attribute );

        attrdat.exit().remove();

        let attr = attrdat.enter().append("g")
                    .attr("class", "attr");

        // line for attribute
        attr.append("path")
              .attr("class", "line")
              .attr("d", d => this.line(d.values) )
              .style("stroke", d => this.z(d.attribute) );

        // text at end of a line
        attr.append("text")
              .datum(d => { return {attribute: d.attribute, value: d.values[d.values.length - 1]}; })
              .attr("transform", d => "translate(" + this.x(d.value.date) + "," + this.y(d.value.value) + ")" )
              .attr("x", 3)
              .attr("dy", "0.35em")
              .style("font", "10px sans-serif")
              .text(d => d.attribute );
    }

    render(){
        return <div ref={node => this.node = node}></div>
    }
}

export default LineChart;