import React, { Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";



class JokeList extends Component {
  static defaultProps = {
    numJokesToGet : 10
  };

  constructor(props) {
    super(props);
    this.state = {
      jokes : []
    }
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.vote = this.vote.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  }

  async getJokes() {
    try {
      let jokes = this.state.jokes;
      let jokeVotes = JSON.parse(
        window.localStorage.getItem("jokeVokes") || "{}"
      );
      let seenJokes = new Set(jokes.map(j => j.id));

      while(jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
            headers: { Accept: "application/json" }
          });
        let { status, ...joke } = res.data;

        if(!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokeVotes[joke.id] = jokeVotes[joke.id] || 0;
          jokes.push({ ...joke, votes : jokeVotes[joke.id] })
        }

        this.setState({ joke });
        window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
      }
    } catch(e){
      console.error(e)
    }
  }

  generateNewJokes() {
    this.setState(st => ({ jokes: [] }));
    this.getJokes();
  }

  vote(id, delta) {
    let jokeVotes = JSON.parse(window.localStorage.getItem("jokeVotes"));
    jokeVotes[id] = (jokeVotes[id] || 0) + delta;
    window.localStorage.setItem("jokeVotes", JSON.stringify(jokeVotes));
    this.setState(st => ({
      jokes : st.jokes.map(j => j.id === id ? {...j, votes : j.votes + delta } : j)}))
  }

  render () {
    let sortedJokes = [...this.state.jokes].sort((a,b) => b.votes - a.votes);

    return (
      <div className="JokeList">
        <button
          className="JokeList-getmore"
          onClick={this.generateNewJokes}
        >
          Get New Jokes
        </button>

        {sortedJokes.map(j => (
          <Joke 
            text={j.joke}
            key={j.id}
            id={j.id}
            votes={j.votes}
            vote={this.vote}
          />
        ))}
      </div>
    )
  }
}

export default JokeList;
