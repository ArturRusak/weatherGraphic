import React, { useEffect } from "react";
import * as d3 from "d3";
import "../static/home/styles.css";
import fetch from "isomorphic-unfetch";

import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home(props) {
  useEffect(() => {
    const { data, error } = props;
    if (!data) {
      return;
    }
    const { hourly } = data;
    let dateMarkers = {
      date: [],
      temperature: []
    };

    hourly.data.map(item => {
      const timeInSeconds = item.time * 1000;
      const date = new Date(timeInSeconds);

      dateMarkers.date.push(date);
      dateMarkers.temperature.push(item.temperature);
    });
    const margin = { top: 10, right: 30, bottom: 90, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Add Y axis
    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(dateMarkers.temperature),
        d3.max(dateMarkers.temperature)
      ])
      .range([400, 0]);

    const xScale = d3.scaleTime().range([0, 960]);
    xScale.domain(d3.extent(dateMarkers.date));

    // 7. d3's line generator
    const line = d3
      .line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    const lineCoordinates = dateMarkers.date.map((item, i) => ({
      x: item,
      y: dateMarkers.temperature[i]
    }));

    const drawYLinesGrid = () => {
      return d3.axisLeft(yScale).ticks(10);
    };

    const drawXLinesGrid = () => {
      return d3.axisBottom(xScale).ticks(10);
    };

    // append the svg object to the body of the page
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 20)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(
        drawYLinesGrid()
          .tickSize(-width)
          .tickFormat("")
      );

    svg
      .append("g")
      .attr("class", "grid")
      .call(
        drawXLinesGrid()
          .tickSize(height)
          .tickFormat("")
      );

    svg
      .append("path")
      .datum(lineCoordinates)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    svg.append("g").call(d3.axisLeft(yScale));

    svg
      .append("g")
      // eslint-disable-next-line no-undef
      .attr("transform", `translate(0, 400)`)
      .call(d3.axisBottom(xScale).ticks(20))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.5em")
      .attr("dy", ".95em")
      .attr("transform", "rotate(-65)");

    // add styles for grid
    svg.selectAll(".grid line").style("opacity", 0.2);
  }, []);

  return (
    <div>
      <Header />
      <div className="content">
        <div className="content-item">
          <h1>Hello World !!!!!</h1>
        </div>
        <div className="content-item">
          <span>RIGHT</span>
        </div>
        <div className="content-item graph">
          <span>Graph1</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}

Home.getInitialProps = async function() {
  // eslint-disable-next-line no-undef
  const response = await (() =>
    fetch(
      "https://api.darksky.net/forecast/177ed2d5a571643fc368b4f16acc1802/53.54,27.30?lang=ru&exclude=flags,alerts"
    )
      .then(res => res.json())
      .then(data => {
        return { data };
      })
      .catch(error => {
        return { error };
      }))();
  return response;
};
