import OpenAI from "openai";
import pptxgen from "pptxgenjs";
import axios from "axios";

const openai = new OpenAI({
  organization: "org-KXKumtFebzRZTj3qnvXNk0Ke",
  project: "proj_xrfP0jGzeYGRIEW7slfFazCT",
});

async function generateImage(description) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: description,
    n: 1,
    size: "1024x1024",
  });
  const imageUrl = response.data[0].url;
  console.log(imageUrl);

  // const imageUrl =
  //   "https://oaidalleapiprodscus.blob.core.windows.net/private/org-KXKumtFebzRZTj3qnvXNk0Ke/user-jk69vqRB1j9QjlqVUFVZQjiV/img-SMIhB7pmsSuukp2vI0QQbj9b.png?st=2024-06-05T09%3A40%3A25Z&se=2024-06-05T11%3A40%3A25Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-06-05T00%3A45%3A57Z&ske=2024-06-06T00%3A45%3A57Z&sks=b&skv=2023-11-03&sig=FfY1NcnlJ76xrD/VHcradtKZ9E4S/K5XlRZCz8BhG1o%3D";

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
}

main();
