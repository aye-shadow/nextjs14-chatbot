"use client";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import RatingComponent from "@/components/ui/RatingComponent"; // Adjust the path as necessary
import Lottie from "lottie-react";
import animationData from "@/components/animations/cat.json";

export default function Home() {
  const [rating, setRating] = useState(0);
  const chatEndRef = useRef(null);

  const [history, setHistory] = useState([
    {
      role: "assistant",
      content: `Hi! I'm NyaJS, your very own Nextjs14 support assistant! How may I help you today?`,
    },
  ]);
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (message.trim() === "") return;

    const newMessage = { role: "user", content: message };
    const old_history = history;
    setHistory((prevHistory) => [...prevHistory, newMessage]);
    setHistory((prevHistory) => [
      ...prevHistory,
      { role: "assistant", content: "" },
    ]);
    setMessage(""); // Clear the input field

    // Send the message to the server
    fetch("/api/pinecone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: newMessage.content,
        chat_history: JSON.stringify(old_history),
      }),
    }).then(async (res) => {
      const reader = res.body.getReader(); // Get a reader to read the response body
      const decoder = new TextDecoder(); // Create a decoder to decode the response text

      let result = "";
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        }); // Decode the text
        setHistory((history) => {
          let lastMessage = history[history.length - 1]; // Get the last message (assistant's placeholder)
          let otherMessages = history.slice(0, history.length - 1); // Get all other history
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text }, // Append the decoded text to the assistant's message
          ];
        });
        return reader.read().then(processText); // Continue reading the next chunk of the response
      });
    });
  };

  // Scroll to the bottom of the chat when history updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: "#F5C6C6" }} // Nude pink background
    >
      <Stack
        direction={"column"}
        width="500px"
        height="450px"
        border="3px solid black"
        p={2}
        spacing={3}
        sx={{ backgroundColor: "white" }} // White chat area background
      >
        <Box
          sx={{
            backgroundColor: "pink",
            width: "100%",
            padding: "10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            borderRadius: "5px",
          }}
        >
          Chatbot Assistant
        </Box>
        <Box
          display="flex"
          justifyContent="center"
          alignItems={"center"}
          minHeight={100}
          maxHeight={100}
          overflow={"hidden"}
        >
          <Lottie
            animationData={animationData}
            style={{ width: 200, height: 200 }}
          />
        </Box>
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          fontSize={12}
        >
          {history.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color="white"
                borderRadius={5}
                px={3}
                py={2}
                sx={{
                  border: "2px solid black",
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={chatEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              "& .MuiInputBase-root": {
                backgroundColor: "pink",
                border: "1px solid black",
                borderRadius: "4px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "black",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              backgroundColor: "black",
              color: "pink",
              "&:hover": {
                backgroundColor: "black",
              },
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: "salmon",
          padding: "10px",
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <RatingComponent value={rating} onChange={setRating} />
        <Box sx={{ color: "black", fontWeight: "bold" }}>Rate our service</Box>
      </Box>
    </Box>
  );
}
