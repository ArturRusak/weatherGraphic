import React, { useEffect } from "react";
import * as d3 from "d3";
import css from "styled-jsx/css";

import Header from "../components/Header";
import Footer from "../components/Footer";

const styles = css`
  .content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background-color: #dadada;
    justify-items: center;
    align-items: center;
  }
  .content-item.graph {
    grid-column-start: span 2;
    padding: 1em;
  }
`;

export default function Home() {
  useEffect(() => {
    const data = [-19, 12, 15, 65, 43, 88, 96, 34];

    const margin = { top: 10, right: 30, bottom: 90, left: 40 };
    const width = 460 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .range([400, 0]);

    const bottom = d3
      .scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .range([0, 400]);

    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("g")
      // eslint-disable-next-line no-undef
      .attr("transform", `translate(-66, ${height - 16})`)
      .call(d3.axisBottom(bottom));
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
      <style jsx>{styles}</style>
    </div>
  );
}
