import { useState, useEffect, useCallback } from "react"
import io from "socket.io-client"
import InviteButton from "./InviteButton"
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  BellIcon,
  CalendarDaysIcon,
  InboxArrowDownIcon,
  ArrowUpOnSquareIcon,
  SunIcon,
  MoonIcon,
  CogIcon,
  PhotoIcon,
  MicrophoneIcon,
  FaceSmileIcon,
  PlusIcon,
  PaperAirplaneIcon,
  VideoCameraIcon,
  PhoneIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid"

const socket = io("http://localhost:5000", {
  withCredentials: true,
})

const generateAvatar = (username) => {
  if (!username) return { initial: "?", backgroundColor: "#cccccc" }
  const avatarKey = `userAvatarImage_${username}`
  const existingAvatar = localStorage.getItem(avatarKey)
  if (existingAvatar) {
    return JSON.parse(existingAvatar)
  }
  const colors = [
    "#FFD700",
    "#FFA07A",
    "#87CEEB",
    "#98FB98",
    "#DDA0DD",
    "#FFB6C1",
    "#FFC0CB",
    "#20B2AA",
    "#FF6347",
    "#708090",
    "#9370DB",
    "#90EE90",
    "#B0E0E6",
  ]
  const backgroundColor = colors[Math.floor(Math.random() * colors.length)]
  const initial = username.charAt(0).toUpperCase()
  const avatarImage = { initial, backgroundColor }
  localStorage.setItem(avatarKey, JSON.stringify(avatarImage))
  return avatarImage
}

const PollCreator = ({ onClose, onSubmit }) => {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])

  const handleAddOption = () => {
    if (options.length < 12) {
      setOptions([...options, ""])
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleSubmit = async () => {
    if (question.trim() && options.filter((opt) => opt.trim()).length >= 2) {
      const pollData = {
        question,
        options: options.filter((opt) => opt.trim()),
        createdBy: localStorage.getItem("userId"),
      }
      try {
        const response = await fetch("http://localhost:5000/api/polls/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pollData),
        })
        if (!response.ok) throw new Error("Failed to create poll")
        const createdPoll = await response.json()
        onSubmit(createdPoll)
      } catch (error) {
        console.error("Error creating poll:", error)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Create Poll</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      {options.map((option, index) => (
        <div key={index} className="flex mb-2">
          <input
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="flex-grow p-2 mr-2 border rounded"
          />
          {index > 1 && (
            <button onClick={() => handleRemoveOption(index)} className="text-red-500 hover:text-red-700">
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      {options.length < 12 && (
        <button onClick={handleAddOption} className="mb-4 text-blue-500 hover:text-blue-700">
          Add Option
        </button>
      )}
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
          Cancel
        </button>
        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Submit Poll
        </button>
      </div>
    </div>
  )
}

const PollDisplay = ({ pollData, onVote, userId }) => {
  if (!pollData || !pollData.votes || !Array.isArray(pollData.votes)) {
    return <div>Error: Invalid poll data</div>
  }

  const totalVotes = pollData.votes.reduce((sum, count) => sum + count, 0)
  const hasVoted = pollData.voters.includes(userId)

  const handleVote = async (optionIndex) => {
    if (!hasVoted) {
      try {
        const response = await fetch("http://localhost:5000/api/polls/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pollId: pollData._id, optionIndex, userId }),
        })
        if (!response.ok) throw new Error("Failed to vote on poll")
        const updatedPoll = await response.json()
        onVote(updatedPoll)
      } catch (error) {
        console.error("Error voting on poll:", error)
      }
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h4 className="font-semibold mb-2">{pollData.question}</h4>
      {pollData.options.map((option, optionIndex) => {
        const voteCount = pollData.votes[optionIndex]
        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
        return (
          <div key={optionIndex} className="mb-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleVote(optionIndex)}
                disabled={hasVoted}
                className={`flex-grow text-left p-2 rounded ${
                  hasVoted
                    ? "bg-gray-200 text-gray-700 cursor-not-allowed"
                    : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                }`}
              >
                {option}
              </button>
              <span className="ml-2 text-sm">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        )
      })}
      <p className="text-sm text-gray-500 mt-2">
        Total votes: {totalVotes} | {hasVoted ? "You have voted" : "You haven't voted yet"}
      </p>
    </div>
  )
}

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(username, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Log in
      </button>
    </form>
  )
}

const ChatApp = () => {
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [search, setSearch] = useState("")
  const [isPollCreatorVisible, setIsPollCreatorVisible] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // Added error state

  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      socket.emit("add-user", userId)
    } else {
      console.warn("User ID not found in localStorage")
    }
    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        setLoading(false)
        setError("No user ID found. Please log in.")
        return
      }
      const response = await fetch(`http://localhost:5000/api/auths/getAllUsers/${userId}`, {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.")
        }
        throw new Error("Failed to fetch user data")
      }
      const data = await response.json()
      const avatarImage = generateAvatar(data.username)
      setUser({ ...data, avatarImage })
      setError(null)
    } catch (error) {
      console.error("Error fetching user data:", error.message)
      setError(error.message || "Failed to load user data. Please try logging in again.")
      setUser(null)
      localStorage.removeItem("userId")
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.msg || "Invalid credentials");
      }

      localStorage.setItem("userId", data.user._id);
      await fetchUser();
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message || "An error occurred while logging in. Please try again.");
    }
};


  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const fetchChannels = async (query = "") => {
    try {
      const response = await fetch("http://localhost:5000/api/auths/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      if (!response.ok) throw new Error("Error fetching channels")
      const data = await response.json()
      const channelsWithAvatars = data.map((channel) => ({
        ...channel,
        avatarImage: generateAvatar(channel.username),
      }))
      setChannels(channelsWithAvatars)
    } catch (error) {
      console.error("Error fetching channels:", error.message)
    }
  }

  useEffect(() => {
    fetchChannels(search)
  }, [search, fetchChannels]) // Added fetchChannels to dependencies

  useEffect(() => {
    socket.on("msg-recieve", ({ msg, from, isChatRequest }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          fromSelf: from === localStorage.getItem("userId"),
          message: msg,
          isChatRequest,
        },
      ])
    })
    return () => {
      socket.off("msg-recieve")
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("darkMode", darkMode)
  }, [darkMode])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearch(query)
  }

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  const handlePollClick = () => {
    setIsPollCreatorVisible(true)
  }

  const handlePollSubmit = (pollData) => {
    setMessages((prevMessages) => [...prevMessages, { fromSelf: true, isPoll: true, pollData }])
    setIsPollCreatorVisible(false)
    socket.emit("send-poll", { to: selectedChannel._id, pollData })
  }

  const handleVote = (updatedPoll) => {
    setMessages((prevMessages) => {
      return prevMessages.map((msg) => {
        if (msg.isPoll && msg.pollData._id === updatedPoll._id) {
          return { ...msg, pollData: updatedPoll }
        }
        return msg
      })
    })
    socket.emit("update-poll", { to: selectedChannel._id, updatedPoll })
  }

  useEffect(() => {
    socket.on("receive-poll", (pollData) => {
      setMessages((prevMessages) => [...prevMessages, { fromSelf: false, isPoll: true, pollData }])
    })

    socket.on("poll-updated", (updatedPoll) => {
      setMessages((prevMessages) => {
        return prevMessages.map((msg) => {
          if (msg.isPoll && msg.pollData._id === updatedPoll._id) {
            return { ...msg, pollData: updatedPoll }
          }
          return msg
        })
      })
    })

    return () => {
      socket.off("receive-poll")
      socket.off("poll-updated")
    }
  }, [])

  const sendMessage = async () => {
    const from = localStorage.getItem("userId")
    const to = selectedChannel._id
    if (!from || !to || !newMessage.trim()) return
    const isChatRequest = !messages.some((msg) => msg.isAccepted)
    const messagePayload = { from, to, message: newMessage, isChatRequest }
    try {
      await fetch("http://localhost:5000/api/messages/addmsg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagePayload),
      })
      if (isChatRequest) {
        socket.emit("chat-request", { from, to, message: newMessage })
      } else {
        socket.emit("send-msg", { to, msg: newMessage, isChatRequest })
      }
      setMessages((prev) => [...prev, { fromSelf: true, message: newMessage }])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleRequest = async (requestId, action) => {
    try {
      const response = await fetch("http://localhost:5000/api/auths/handleRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      })
      if (!response.ok) throw new Error("Failed to handle request")
      const data = await response.json()
      console.log("Request handled successfully:", data)
    } catch (error) {
      console.error("Error handling request:", error)
    }
  }

  useEffect(() => {
    socket.on("connect", () => {
      const fetchUnreadMessages = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/messages/get", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ from: user, to: selectedChannel }),
          })
          if (response.ok) {
            const messages = await response.json()
            setMessages(messages)
          }
        } catch (error) {
          console.error("Error fetching unread messages:", error)
        }
      }
      fetchUnreadMessages()
    })
    return () => {
      socket.off("connect")
    }
  }, [user, selectedChannel])

  return (
    <div className={`flex h-screen ${darkMode ? "dark" : ""}`}>
      <aside className="w-20 bg-gradient-to-br from-blue-300 to-gray-500 dark:from-gray-800 dark:to-gray-900 flex flex-col py-6 space-y-6 items-center">
        {loading ? (
          <div className="h-16 w-16 rounded-full bg-gray-300 animate-pulse" />
        ) : user ? (
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ backgroundColor: user.avatarImage.backgroundColor }}
          >
            {user.avatarImage.initial}
          </div>
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-400 flex items-center justify-center text-white">?</div>
        )}
        <div className="space-y-6">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer" />
          <UserGroupIcon className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer" />
          <BellIcon className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer" />
          <CalendarDaysIcon className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer" />
          <InboxArrowDownIcon className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer" />
          <ArrowUpOnSquareIcon className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer" />
        </div>
        <div className="flex-1" />
        <button className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer" onClick={toggleDarkMode}>
          {darkMode ? <SunIcon className="h-8 w-8" /> : <MoonIcon className="h-8 w-8" />}
        </button>
        <button className="h-8 w-8 text-white hover:text-gray-300 cursor-pointer">
          <CogIcon />
        </button>
      </aside>

      <aside className="w-80 bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search..."
            className="w-full p-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {channels.map((channel) => (
            <div
              key={channel._id}
              className={`cursor-pointer p-2 rounded flex items-center shadow-sm ${
                selectedChannel?._id === channel._id
                  ? "bg-blue-400 dark:bg-gray-600"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-500"
              }`}
              onClick={() => setSelectedChannel(channel)}
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: channel.avatarImage.backgroundColor }}
              >
                {channel.avatarImage.initial}
              </div>
              <div className="ml-2">
                <p className="text-lg font-semibold">{channel.username}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{channel.latestMessage || "No messages yet"}</p>
              </div>
            </div>
          ))}
        </div>
        {/* <button className="m-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Invite</button> */}
        <InviteButton chatId="someChatId" />
      </aside>

      <main className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-200 dark:from-gray-900 dark:to-gray-800">
        {loading ? (
          <div className="flex items-center justify-center h-screen">Loading...</div>
        ) : !user ? (
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
              <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
              {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        ) : selectedChannel ? (
          <>
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-400 dark:border-gray-600">
              <div className="flex items-center space-x-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold border border-gray-400 dark:border-gray-600"
                  style={{ backgroundColor: selectedChannel.avatarImage.backgroundColor }}
                >
                  {selectedChannel.avatarImage.initial}
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedChannel.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <VideoCameraIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
                <PhoneIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
                <UserPlusIcon className="h-6 w-6 text-blue-500 cursor-pointer" />
                <EllipsisVerticalIcon className="h-6 w-6 text-gray-600 dark:text-gray-300 cursor-pointer" />
              </div>
              <div className="flex space-x-4">
                {selectedChannel?.isChatRequest && (
                  <>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => handleRequest(selectedChannel.requestId, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      onClick={() => handleRequest(selectedChannel.requestId, "reject")}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </header>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}>
                  {msg.isPoll ? (
                    <PollDisplay pollData={msg.pollData} onVote={handleVote} userId={user._id} />
                  ) : (
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        msg.fromSelf ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                      }`}
                    >
                      {msg.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <footer className="p-4 bg-gray-100 dark:bg-gray-700 border-t border-gray-400 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <PhotoIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <MicrophoneIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <FaceSmileIcon className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <PlusIcon
                  className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer"
                  onClick={handlePollClick}
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-full"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 px-4 py-2 text-white rounded-full hover:bg-blue-500"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-400">
            Select a channel to start chatting
          </div>
        )}
      </main>
      {isPollCreatorVisible && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <PollCreator onClose={() => setIsPollCreatorVisible(false)} onSubmit={handlePollSubmit} />
        </div>
      )}
      {error && <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4">{error}</div>}
    </div>
  )
}

export default ChatApp

