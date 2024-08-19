import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_APIKEY,
  dangerouslyAllowBrowser: true,
});

export const recognize = async (image: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "IDENTIFY THE ITEM THE PERSON IS HOLDING.",
          },
          {
            type: "text",
            text: 'The resulting JSON object should be in this format: {"itemName":"string","category":"string"}.',
          },
          {
            type: "text",
            text: "BE VERY SPECFIC IN IDENTIFYING THE ITEM NAME.",
          },
          {
            type: "text",
            text: "BE VERY SPECFIC IN IDENTIFYING THE ITEM CATEGORY WITH ONE WORD.",
          },
          {
            type: "text",
            text: "CAPTILIZE THE FIRST LETTER IN EVERY WORD.",
          },
          {
            type: "text",
            text: "IF YOU CAN'T IDENTIFY THE ITEM, RETURN EMPTY JSON OBJECT",
          },
          {
            type: "text",
            text: "DO NOT WRAP THE JSON OBJECT AROUND ANYTHING, JUST THE OBJECT.",
          },
          {
            type: "image_url",
            image_url: {
              url: image,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });
  return response.choices[0].message.content;
};
