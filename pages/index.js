import React from "react";
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
  const linearScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, 1]);

  console.log(linearScale);

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
          <span>Graph</span>
        </div>
      </div>
      <Footer />
      <style jsx>{styles}</style>
    </div>
  );
}
