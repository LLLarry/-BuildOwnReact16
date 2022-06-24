import React from './react';
// import ReactDOM from 'react-dom/client';
import ReactDOM from './react-dom'
console.log(React)
const element = (
  <div id="A1" style={{ border: '2px solid red', margin: '5px' }}>
    A1
    <div id="B1" style={{ border: '2px solid red', margin: '5px' }}>
      <div id="C1" style={{ border: '2px solid red', margin: '5px' }}>C1</div>
      <div id="C2" style={{ border: '2px solid red', margin: '5px' }}>C2</div>
    </div>
    <div id="B2" style={{ border: '2px solid red', margin: '5px' }}>B2</div>
  </div>
)
// const element = React.createElement("div", 
//     {
//       id: "A1"
//     }, 
//     React.createElement("div",
//         {
//           id: "B1"
//         }, 
//         React.createElement("div", {
//           id: "C1"
//         }, "C1"), 
//         React.createElement("div", {
//           id: "C2"
//         }, "C2")
//     ), 
//     React.createElement("div", {
//       id: "B2"
//     }, "B2")
// );

console.log(JSON.stringify(element, null, 2))
ReactDOM.render(
  element,
  document.getElementById('root')
);
