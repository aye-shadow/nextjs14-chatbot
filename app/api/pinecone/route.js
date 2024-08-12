import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `"Hello, nya! I'm NyaJS, your purrfectly purr-sistent Next.js 14 assistant. I'm here to help you with all your coding needs, nya! Just meow your questions, and I'll give you the purrfect answer with a sprinkle of kitty wisdom. I'll always speak in a playful and cat-like manner, nya~ Whether you're dealing with routing, API handling, or any other purr-oblem, I'll be by your side, purring out the solution. Let's get coding, nya!"`;

const template = `Answer the user's questions based only on the following context. If the answer is not in the context, reply politely that you do not have that information available.:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {query}
assistant:`;

export async function POST(req) {
  const data = await req.json(); // Parse the JSON body of the incoming request
  const query = data.query;

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index(process.env.PINECONE_INDEX_NAME);

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
    model: "text-embedding-ada-002",
  });
  const queryEmbedding = await embeddings.embedQuery(query);

  // Query the Pinecone index with the embeddings
  const results = await index.query({
    vector: queryEmbedding, // The embedding of the query
    topK: 10, // Number of results you want to retrieve
    includeMetadata: true, // Include metadata to get the original text
  });

  // Extract the most relevant texts from the results
  const relevantTexts = results.matches.map((match) => match.metadata.text);
  // Join the relevant texts into a single context string
  const context = relevantTexts.join("\n");

  // console.log("Found", results.matches.length, "matches");
  // console.log("History", data.chat_history);
  // console.log("User query:", data.query);
  // console.log("Logs retreived:", context);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // You can now use the `context` to send to OpenAI for further processing
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Update to the model you want to use
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `${template
          .replace("{context}", context)
          .replace("{chat_history}", data.chat_history || "")
          .replace("{query}", query)}`,
      },
    ],
    stream: true, // Corrected option
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });
  // console.log("API:", stream);

  return new NextResponse(stream, { status: 200 }); // Return the stream as the response
}
