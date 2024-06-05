import OpenAI from "openai";
import pptxgen from "pptxgenjs";
import axios from "axios";

const openai = new OpenAI({
  organization: "org-KXKumtFebzRZTj3qnvXNk0Ke",
  project: "proj_xrfP0jGzeYGRIEW7slfFazCT",
});

async function generateImage(description) {
  // const response = await openai.images.generate({
  //   model: "dall-e-3",
  //   prompt: description,
  //   n: 1,
  //   size: "1024x1024",
  // });
  // const imageUrl = response.data[0].url;
  // console.log(imageUrl);

  const imageUrl =
    "https://oaidalleapiprodscus.blob.core.windows.net/private/org-KXKumtFebzRZTj3qnvXNk0Ke/user-jk69vqRB1j9QjlqVUFVZQjiV/img-aY1DAN8ceORYqhG2pwNeAuqh.png?st=2024-06-05T08%3A32%3A37Z&se=2024-06-05T10%3A32%3A37Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-06-04T10%3A39%3A53Z&ske=2024-06-05T10%3A39%3A53Z&sks=b&skv=2023-11-03&sig=C4Yavcx39QPZxrAdrgDdfUQ26/HNARfydETuNgL/AZE%3D";

  // const response = await openai.createImage({
  //   prompt: description,
  //   n: 1,
  //   size: "512x512",
  // });

  // const imageUrl = response.data.data[0].url;
  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const imageBase64 = Buffer.from(imageResponse.data, "binary").toString(
    "base64"
  );

  return `data:image/png;base64,${imageBase64}`;
}

async function main() {
  const topic = "Kubernetes";
  const prompt = `Create an outline for a presentation on the topic "${topic}" with the following slides: Introduction, Main Points (3 slides), Conclusion.`;

  const stream = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
    // stream: true,
  });
  // for await (const chunk of stream) {
  //   process.stdout.write(chunk.choices[0]?.delta?.content || "");
  // }
  // console.log(stream?.choices[0]?.message?.content);
  const content = stream?.choices[0]?.message?.content;

  const slidesContent = content
    .split("\n\n")
    .filter((slide) => slide.trim() !== "");

  // console.log(slidesContent);

  const pptx = new pptxgen();
  pptx.defineLayout({ name: "A4", width: 8.27, height: 11.69 });
  pptx.layout = "LAYOUT_WIDE";

  const colorSchemes = ["#FF6347", "#4682B4", "#32CD32", "#FFD700", "#FF69B4"];

  for (let i = 0; i < slidesContent.length; i++) {
    console.log(`Generating slide ${i + 1} of ${slidesContent.length}`);
    const slide = pptx.addSlide();
    slide.background = { fill: colorSchemes[i % colorSchemes.length] };
    slide.addText(slidesContent[i], {
      x: 0.5,
      y: 0.5,
      w: "90%",
      h: "30%",
      align: "center",
      fontSize: 24,
      bold: true,
      color: "FFFFFF", // White text color
      valign: "middle",
    });

    // Generate an image for each slide based on the slide content
    const imageBase64 = await generateImage(slidesContent[i]);
    slide.addImage({ data: imageBase64, x: 0.5, y: 3.5, w: 5, h: 5 });
  }

  pptx.writeFile({
    fileName: `${topic.replace(/\s+/g, "_")}_Presentation.pptx`,
  });

  // const response = await openai.images.generate({
  //   model: "dall-e-3",
  //   prompt: "a white siamese cat",
  //   n: 1,
  //   size: "1024x1024",
  // });
  // const image_url = response.data[0].url;
  // console.log(image_url);
  try {
    // createPdf(image_url);
  } catch (err) {
    console.error(err);
  }
  // console.log(completion.choices[0]);
}

main();

import { PDFDocument, rgb } from "pdf-lib";
import fetch from "node-fetch";
import fs from "fs";

async function createPdf(imageUrl) {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();

  // Add a blank page to the document
  const page = pdfDoc.addPage([600, 400]);

  // Draw some text on the page
  page.drawText("Hello, this is a sample text!", {
    x: 50,
    y: 350,
    size: 30,
    color: rgb(0, 0.53, 0.71),
  });

  // URL of the image
  // const imageUrl = "https://example.com/image.png";

  // Fetch the image from the URL
  const response = await fetch(imageUrl);
  const imgBytes = await response.arrayBuffer();

  // Embed the image in the PDF
  const pngImage = await pdfDoc.embedPng(imgBytes);

  // Get the dimensions of the image
  const pngDims = pngImage.scale(0.5);

  // Draw the image on the page
  page.drawImage(pngImage, {
    x: 50,
    y: 200,
    width: pngDims.width,
    height: pngDims.height,
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Write the PDF to a file
  fs.writeFileSync("output.pdf", pdfBytes);
}

// import OpenAI from "openai";
// const openai = new OpenAI();

// async function main() {
//   const assistant = await openai.beta.assistants.create({
//     name: "Slides creater",
//     instructions: "You are a personal assitant. Create a slide deck.",
//     // tools: [{ type: "code_interpreter" }],
//     model: "gpt-4o",
//   });

//   const title = "I want to dive deep into kubernetes and how it works";

//   const thread = await openai.beta.threads.create();

//   const message = await openai.beta.threads.messages.create(thread.id, {
//     role: "user",
//     content: "I need to create a slide deck. Here's the instructions: " + title,
//   });

//   // We use the stream SDK helper to create a run with
//   // streaming. The SDK provides helpful event listeners to handle
//   // the streamed response.

//   const run = openai.beta.threads.runs
//     .stream(thread.id, {
//       assistant_id: assistant.id,
//     })
//     .on("textCreated", (text) => process.stdout.write("\nassistant > "))
//     .on("textDelta", (textDelta, snapshot) =>
//       process.stdout.write(textDelta.value)
//     )
//     .on("toolCallCreated", (toolCall) =>
//       process.stdout.write(`\nassistant > ${toolCall.type}\n\n`)
//     )
//     .on("toolCallDelta", (toolCallDelta, snapshot) => {
//       if (toolCallDelta.type === "code_interpreter") {
//         if (toolCallDelta.code_interpreter.input) {
//           process.stdout.write(toolCallDelta.code_interpreter.input);
//         }
//         if (toolCallDelta.code_interpreter.outputs) {
//           process.stdout.write("\noutput >\n");
//           toolCallDelta.code_interpreter.outputs.forEach((output) => {
//             if (output.type === "logs") {
//               process.stdout.write(`\n${output.logs}\n`);
//             }
//           });
//         }
//       }
//     });
// }

// main();
