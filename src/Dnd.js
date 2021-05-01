import React from "react";
import { Draggable, Droppable } from "react-drag-and-drop";

class Dnd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fruits: ["apple", "orange", "pineapple", "peach", "kiwi"],
      currentParent: null
    };
  }
  render() {
    const { fruits } = this.state;
    return (
      <div>
        <Droppable>
          <ul className="Smoothie" id="new" onDrop={this.drop.bind(this)}>
            {fruits.map((item, i) => {
              return (
                <li
                  key={i}
                  id={"li" + item + i}
                  onDragStart={this.dragStart.bind(this)}
                  draggable="true"
                >
                  <details id={"details" + item + i}>
                    <summary id={"summary" + item + i}>{item}</summary>
                    Name of the item is {item}.
                  </details>
                </li>
              );
            })}
          </ul>
        </Droppable>
        <Droppable>
          <ul
            className="Smoothie"
            id="inprogress"
            onDrop={this.drop.bind(this)}
          />
        </Droppable>
        <Droppable>
          <ul
            className="Smoothie"
            id="completed"
            onDrop={this.drop.bind(this)}
          />
        </Droppable>
      </div>
    );
  }
  allowDrop(event) {
    event.preventDefault();
  }
  drop(event) {
    console.log(event);
    // if (event.target.localName == "ul") {
    //   if (event.target.id !== this.state.currentParent) {
    //     var data = event.dataTransfer.getData("Text");
    //     event.target.appendChild(document.getElementById(data));
    //   }
    // }
    // if (event.target.localName !== "ul") {
    //   var element = document.getElementById(event.target.id);
    //   var closest = element.closest("ul");
    //   if (closest) {
    //     // console.log(closest.getAttribute("id"));
    //     closest.style.border = "10px solid yellow";
    //   }
    //   if (event.target.parentNode.id !== this.state.currentParent) {
    //     var data = event.dataTransfer.getData("Text");
    //     document
    //       .getElementById(closest.getAttribute("id"))
    //       .appendChild(document.getElementById(data));
    //   }
    // }
  }
  dragStart(event) {
    event.dataTransfer.setData("Text", event.target.id);
    console.log(event.target.parentNode.id);
    this.setState({ currentParent: event.target.parentNode.id });
  }
}
export default Dnd;
