import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Connect to the backend socket server
const socket = io("http://localhost:5000");

const PollApp = () => {
  // State for storing polls, poll creation, and voting
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [createdBy, setCreatedBy] = useState("user123"); // Hardcoded user ID for now
  const [selectedOption, setSelectedOption] = useState(null);

  // Fetch all polls from the backend on mount
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get("http://localhost:5000/polls/polls");
        setPolls(response.data);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    fetchPolls();
  }, []);

  // Socket listener for real-time updates to polls
  useEffect(() => {
    socket.on("pollUpdated", (updatedPoll) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll._id === updatedPoll._id ? updatedPoll : poll
        )
      );
    });
  }, []);

  // Handle option change for poll creation
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  // Handle poll creation
  const handleCreatePoll = async () => {
    if (!question || options.some((option) => option.trim() === "")) {
      alert("Please provide a question and at least two options.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/polls/create", {
        question,
        options,
        createdBy,
      });
      setPolls([...polls, response.data]); // Add the newly created poll to the list
      alert("Poll created successfully!");
      setQuestion("");
      setOptions(["", ""]); // Reset the form
    } catch (error) {
      console.error("Error creating poll:", error);
      alert("Error creating poll");
    }
  };

  // Handle voting on a poll
  const handleVote = async (pollId) => {
    if (selectedOption === null) {
      alert("Please select an option to vote.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/polls/vote", {
        pollId,
        optionIndex: selectedOption,
        userId: createdBy, // Use actual user ID here
      });
      alert("Vote submitted!");
      socket.emit("pollUpdated", response.data); // Emit real-time update to other clients
    } catch (error) {
      console.error("Error voting on poll:", error);
      alert("Error voting on poll");
    }
  };

  return (
    <div>
      <h1>Poll App</h1>

      {/* Poll Creation Form */}
      <div>
        <h2>Create a Poll</h2>
        <input
          type="text"
          placeholder="Enter poll question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {options.map((option, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleCreatePoll}>Create Poll</button>
      </div>

      {/* Display Polls */}
      <div>
        <h2>Polls</h2>
        {polls.map((poll) => (
          <div key={poll._id}>
            <h3>{poll.question}</h3>
            {poll.options.map((option, index) => (
              <div key={index}>
                <button onClick={() => setSelectedOption(index)}>
                  {option.option} - {option.votes} votes
                </button>
              </div>
            ))}
            <button onClick={() => handleVote(poll._id)}>Vote</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollApp;
