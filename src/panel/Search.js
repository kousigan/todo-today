import React from "react";
import FeatherIcon from "feather-icons-react";
import { months } from "../panel/names";
import { db } from "../db/config";
import "../style.css";

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: []
    };
  }
  querySearch = e => {
    var query = e.target.value.toLowerCase();
    if (query.length > 2) {
      // console.log("test");
      db.collection("todo-kousi")
        .get()
        .then(snapshot => {
          const temp = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          var sr = temp.filter(li => li.name.toLowerCase().includes(query));
          this.setState({
            results: sr
          });
        });
    }
  };
  checkDuplicate = (arr, item) => {
    var temp = arr.some(li => li.id == item.id);
    return temp;
  };
  hideSearch = () => {
    this.props.hide(false);
  };
  chooseDate = e => {
    this.props.select(e.target);
  };
  render() {
    // console.log("render", this.state.results);
    const { results } = this.state;
    var listItems = results.map((item, i) => (
      <div className="section resultItem" key={i}>
        <button
          data-day={item.date.day}
          data-month={item.date.month}
          data-year={item.date.year}
          data-dayname={item.date.name}
          onClick={this.chooseDate}
        >
          {months[item.date.month]} {item.date.day} {item.date.year}{" "}
          <FeatherIcon icon="arrow-right" />
        </button>{" "}
        {item.name}
      </div>
    ));
    return (
      <div className="overlay-container getModal">
        <div className="card getSearchResults">
          <h3 className="section">Search tasks</h3>
          <div className="section input">
            <input
              type="text"
              id="searchtask"
              placeholder="Enter atleast 4 characters"
              onKeyDown={this.querySearch}
            />
            <button onClick={this.hideSearch}>Hide</button>
          </div>
          {listItems}
        </div>
      </div>
    );
  }
}

export default Search;
