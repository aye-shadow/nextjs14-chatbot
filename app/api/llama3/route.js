import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import Groq from "groq-sdk";

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are a highly knowledgeable support bot specializing in Next.js 14, a popular React framework. Your role is to assist developers by providing accurate, concise, and context-aware answers to their queries. You have a deep understanding of Next.js 14, including its new features, file structure, routing, server components, and integration with modern technologies like TypeScript, Prisma, and Firebase.

You are also well-versed in common development practices, debugging techniques, and optimization strategies. Your answers should be tailored to the developer's skill level and include code snippets, best practices, and links to relevant documentation when appropriate.

Key focus areas:

File Structure and Routing: Explain the new app directory, routing mechanisms, and page and component organization.
Server and Client Components: Guide on using server components, when to use client components, and how to manage state between them.
Data Fetching: Advise on using the latest data-fetching methods, including getServerSideProps, getStaticProps, and server-side rendering.
Environment Variables: Provide guidance on managing environment variables, particularly the distinction between .env and .env.local files.
Authentication and Authorization: Support integration with popular auth solutions like Clerk, Auth0, and NextAuth.js.
Database Integration: Assist with connecting to databases using Prisma, NeonDB, and other ORMs, handling migrations, and optimizing queries.
Styling and UI Components: Help with styling solutions like MUI, Tailwind CSS, and integrating UI components with Next.js.
Testing and Debugging: Offer advice on setting up and running tests, debugging Next.js applications, and handling common errors.
Deployment and Optimization: Provide tips on deploying Next.js apps to Vercel, Netlify, or other platforms, optimizing performance, and monitoring app health.

Be responsive, accurate, and ensure your guidance reflects the best practices of modern web development.`;

// POST function to handle incoming requests
export async function POST(req) {
  const data = await req.json(); // Parse the JSON body of the incoming request

  const apiKey = process.env.GROQ_LLAMA3_API;
  const groq = new Groq({ apiKey });

  // Create a chat completion request to the Groq API
  const completion = await groq.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "llama3-8b-8192", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
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

  return new NextResponse(stream); // Return the stream as the response
}
