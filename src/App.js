import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import LineChart from './d3-linechart';

import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

import * as d3 from 'd3';

class App extends Component {

  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      data: [],
      root: {},
      isOpen: false
    }
  }

  componentDidMount() {
    this.getData();
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  getData(){
      d3.csv('/data/petasense_data.csv', d => {
          var dateParse = d3.utcParse("%d/%m/%y");

          // make sure types are numbers /dates as required
          d3.keys(d).forEach( key => {
              if(key !== 'date'){
                  d[key] = +d[key];
              } else {
                  d[key] = dateParse(d[key]);
              }
          });
          return d;
      }, (error, root) => {
          if (error) throw error;

          // rearrange data so each attribute has its values together along with dates
          // eg structure: {
          /*    attribute: 'temperature',
          **    values: [
          **        { date: <Date object>, value: 4.654}
          **    ]
          ** }
          */
          let data = root.columns.slice(1).map( attr => {
              return {
                attribute: attr,
                values: root.map( d => {
                  return {
                      date: d.date,
                      value: d[attr]
                  };
                })
              };
          });

          // update data
          this.setState({
            data: data,
            root: root
          })
      });
  }

  render() {
    return (
      <div>

        <Navbar color="faded" light expand="md">
          <NavbarBrand href="/">reactstrap</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/components/">Components</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap">Github</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>

        <h4>PetaSense</h4>
        <LineChart data={this.state.data} root={this.state.root} />
      </div>
    );
  }
}

export default App;
